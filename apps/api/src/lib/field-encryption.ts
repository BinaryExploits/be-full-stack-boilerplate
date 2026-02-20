import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { Logger } from '@repo/utils-core';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const PREFIX = 'enc:';

let cachedKey: Buffer | null = null;

function getKey(): Buffer | null {
  if (cachedKey) return cachedKey;

  const hex = process.env.FIELD_ENCRYPTION_KEY;
  if (!hex) return null;

  if (hex.length !== 64) {
    Logger.instance
      .withContext('FieldEncryption')
      .critical(
        'FIELD_ENCRYPTION_KEY must be a 64-char hex string (32 bytes). Encryption disabled.',
      );
    return null;
  }

  cachedKey = Buffer.from(hex, 'hex');
  return cachedKey;
}

export function encryptField(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext;

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted.toString('base64')}`;
}

/**
 * Decrypts a field value. If the value wasn't encrypted (no prefix),
 * returns it as-is — this provides a smooth migration path for
 * pre-existing plaintext data.
 */
export function decryptField(ciphertext: string): string {
  if (!ciphertext.startsWith(PREFIX)) return ciphertext;

  const key = getKey();
  if (!key) return ciphertext;

  try {
    const payload = ciphertext.slice(PREFIX.length);
    const [ivB64, tagB64, dataB64] = payload.split('.');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');
    const encrypted = Buffer.from(dataB64, 'base64');

    const decipher = createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    Logger.instance
      .withContext('FieldEncryption')
      .critical('Failed to decrypt field — returning raw value');
    return ciphertext;
  }
}
