# Authentication

This boilerplate uses **Better Auth** with three authentication methods: Google OAuth, Email OTP, and Email & Password. All methods are enabled by default and support account linking.

---

## Table of Contents

- [Overview](#overview)
- [Authentication Methods](#authentication-methods)
- [Account Linking](#account-linking)
- [Security Features](#security-features)
- [Email Service Setup](#email-service-setup)
- [Environment Configuration](#environment-configuration)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Key Features

- **Three sign-in methods** enabled by default
- **Account linking**: Users can connect multiple auth methods to one account
- **Email verification**: Optional email verification flow
- **OAuth token encryption**: Tokens encrypted at rest using AES-256-GCM
- **Session management**: Secure session handling with IP and user agent tracking
- **Mobile support**: Expo integration via `@better-auth/expo`

### Better Auth Integration

Better Auth is configured in `apps/api/src/modules/auth/auth.ts` with:
- Prisma adapter for database persistence
- Multiple authentication providers
- Email verification and OTP support
- Field-level encryption for sensitive data

---

## Authentication Methods

### 1. Google OAuth

Sign in with Google using OAuth 2.0.

**Features**:
- One-click authentication
- Automatic profile data import (name, email, profile picture)
- Offline access with refresh tokens
- Google Drive API scopes (optional)

**User Experience**:
1. User clicks "Sign in with Google"
2. Redirected to Google consent screen
3. User authorizes the application
4. Redirected back with authenticated session

**Setup Required**:
- Google Cloud Console project
- OAuth 2.0 credentials (Client ID + Secret)
- Authorized redirect URIs configured

### 2. Email OTP (One-Time Password)

Passwordless authentication via email verification code.

**Features**:
- No password to remember
- 6-digit verification code
- Time-limited codes (typically 10 minutes)
- Automatic sign-in after verification

**User Experience**:
1. User enters email address
2. System sends 6-digit OTP via email
3. User enters OTP code
4. Authenticated session created

**Use Cases**:
- Quick sign-in without passwords
- Users who prefer passwordless auth
- Mobile-first experiences

### 3. Email & Password

Traditional authentication with email and password.

**Features**:
- Standard username/password flow
- Password reset via email
- Secure password hashing (bcrypt)
- Email verification (optional, disabled in development)

**User Experience**:
1. User creates account with email + password
2. (Optional) Email verification sent
3. User signs in with credentials

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Account Linking

Users can link multiple authentication methods to a single account.

### How It Works

1. User signs in with Google → Account created with Google provider
2. User sets a password → Email/password linked to same account
3. User can now sign in with either Google or email/password

### Trusted Providers

The following providers are configured as "trusted" for automatic account linking:

```typescript
account: {
  accountLinking: {
    enabled: true,
    trustedProviders: ['google'],
  },
}
```

This means:
- If an account exists with an email, Google can automatically link to it
- Users don't need to manually merge accounts
- Seamless multi-provider experience

### Frontend Example

```typescript
// User already has account with email/password
// Now they sign in with Google using the same email
// Better Auth automatically links the accounts
// User can now use both methods to sign in
```

---

## Security Features

### 1. OAuth Token Encryption

OAuth tokens (access, refresh, ID tokens) are **encrypted at rest** using AES-256-GCM.

**Implementation**:
- Tokens encrypted before database write
- Tokens decrypted on database read
- Uses Prisma middleware for automatic encryption/decryption
- Key stored in `FIELD_ENCRYPTION_KEY` environment variable

**Why This Matters**:
- Protects tokens if database is compromised
- Complies with security best practices
- Required for handling sensitive OAuth data

**Generate Encryption Key**:
```bash
openssl rand -hex 32
```

This produces a 64-character hexadecimal key (32 bytes).

### 2. Password Security

- Passwords are **hashed** using bcrypt (never stored in plain text)
- Passwords are **never logged** or exposed in error messages
- Password reset uses time-limited, single-use tokens

### 3. Session Security

Sessions include:
- IP address tracking
- User agent tracking
- Automatic expiration (7 days default)
- Secure, signed cookies
- HTTPS enforcement in production

### 4. Email Verification

Email verification can be enabled/disabled per environment:

```typescript
emailVerification: {
  autoSignInAfterVerification: true,
  sendOnSignUp: !isDevelopment, // Disabled in development
  sendVerificationEmail: async ({ user, url }) => {
    // Send email with verification link
  },
}
```

---

## Email Service Setup

The boilerplate supports two email providers:

### Option 1: AWS SES (Recommended for Production)

**Setup**:
1. Create AWS account and verify SES identity (domain or email)
2. Configure AWS credentials (IAM role, SSO, or access keys)
3. Set environment variables

**Environment Variables**:
```bash
# apps/api/.env
AWS_SES_REGION=us-west-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

**Benefits**:
- Low cost ($0.10 per 1,000 emails)
- High deliverability
- Production-ready infrastructure
- Automatic credential resolution from AWS SDK

### Option 2: Resend (Recommended for Development)

**Setup**:
1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Verify sending domain (optional, can use resend.dev for testing)

**Environment Variables**:
```bash
# apps/api/.env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Benefits**:
- Easy setup for development
- Free tier available
- Modern API
- Built-in analytics

### Email Templates

The system sends the following emails:

1. **Email Verification** (sign up)
   - Subject: "Verify your email"
   - Contains clickable verification link

2. **OTP Code** (sign in)
   - Subject: "Your sign-in code"
   - Contains 6-digit code

3. **Password Reset** (forgot password)
   - Subject: "Reset your password"
   - Contains password reset link

Templates are customizable in `apps/api/src/modules/email/email.service.ts`.

---

## Environment Configuration

### Required Environment Variables

Add these to `apps/api/.env`:

```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=your-random-secret-here
BETTER_AUTH_URL=http://localhost:4000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:*,http://*.localhost:*

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Field Encryption (generate with: openssl rand -hex 32)
FIELD_ENCRYPTION_KEY=your-64-character-hex-key-here

# Email Service - Option 1: AWS SES
AWS_SES_REGION=us-west-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# Email Service - Option 2: Resend
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:4000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Copy Client ID and Client Secret to `.env`

### Trusted Origins

List all domains where your frontend runs:

```bash
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8081,https://yourdomain.com,https://*.yourdomain.com,mobile://,exp://
```

This ensures:
- Cookies work across domains
- CORS is properly configured
- Mobile auth works correctly

---

## Usage Examples

### Frontend (React / Next.js)

#### Sign In with Google

```typescript
import { signIn } from '@repo/trpc/auth-client';

export function GoogleSignInButton() {
  const handleSignIn = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  return (
    <button onClick={handleSignIn}>
      Sign in with Google
    </button>
  );
}
```

#### Sign In with Email OTP

```typescript
import { signIn } from '@repo/trpc/auth-client';
import { useState } from 'react';

export function OTPSignIn() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const sendOTP = async () => {
    await signIn.emailOtp.sendOtp({ email });
    setStep('otp');
  };

  const verifyOTP = async () => {
    await signIn.emailOtp.verifyOtp({ email, otp });
    // User is now authenticated
  };

  if (step === 'email') {
    return (
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <button onClick={sendOTP}>Send OTP</button>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter 6-digit code"
      />
      <button onClick={verifyOTP}>Verify</button>
    </div>
  );
}
```

#### Sign In with Email & Password

```typescript
import { signIn } from '@repo/trpc/auth-client';
import { useState } from 'react';

export function EmailPasswordSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    await signIn.email({
      email,
      password,
      callbackURL: '/',
    });
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
}
```

#### Sign Up with Email & Password

```typescript
import { signUp } from '@repo/trpc/auth-client';

export function EmailPasswordSignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = async () => {
    await signUp.email({
      email,
      password,
      name,
      callbackURL: '/',
    });
  };

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
}
```

#### Get Current User

```typescript
import { useSession } from '@repo/trpc/auth-client';

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
      {session.user.image && (
        <img src={session.user.image} alt="Profile" />
      )}
    </div>
  );
}
```

#### Sign Out

```typescript
import { signOut } from '@repo/trpc/auth-client';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth/signin';
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

---

## Troubleshooting

### "Invalid origin" Error

**Cause**: The frontend domain is not in `BETTER_AUTH_TRUSTED_ORIGINS`.

**Solution**: Add the domain to the environment variable:
```bash
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8081,https://yourdomain.com
```

### Google OAuth Redirect Mismatch

**Cause**: Redirect URI in Google Console doesn't match your API URL.

**Solution**: Ensure redirect URI is set to:
```
http://localhost:4000/api/auth/callback/google
```

### OTP Not Received

**Cause**: Email service not configured or email blocked.

**Solution**:
1. Check email service logs (AWS SES or Resend dashboard)
2. Verify `AWS_SES_FROM_EMAIL` or `RESEND_FROM_EMAIL` is correct
3. Check spam folder
4. Ensure sending domain is verified (production)

### "Email verification required" Error

**Cause**: Email verification is enabled, but user hasn't verified.

**Solution**:
- Disable verification in development: Check `!isDevelopment` flag
- Send verification email again via "Resend verification" link
- Manually verify in database (development only):
  ```sql
  UPDATE "user" SET email_verified = true WHERE email = 'user@example.com';
  ```

### "Field encryption key not set"

**Cause**: `FIELD_ENCRYPTION_KEY` environment variable is missing.

**Solution**: Generate and set the key:
```bash
openssl rand -hex 32
# Copy output to .env
FIELD_ENCRYPTION_KEY=your_64_char_hex_key_here
```

---

## Security Best Practices

### 1. Rotate Encryption Keys Regularly

For production systems, implement key rotation:
1. Generate new key
2. Decrypt existing tokens with old key
3. Re-encrypt with new key
4. Update `FIELD_ENCRYPTION_KEY`

### 2. Use Environment-Specific Secrets

Never reuse secrets across environments:
- Development: Use test credentials
- Staging: Use staging credentials
- Production: Use production credentials

### 3. Enable Email Verification in Production

```typescript
emailVerification: {
  sendOnSignUp: process.env.NODE_ENV === 'production',
}
```

### 4. Limit OAuth Scopes

Only request necessary Google scopes:
```typescript
scope: [
  'openid',
  'email',
  'profile',
  // Only add Drive scopes if actually needed
  // 'https://www.googleapis.com/auth/drive.readonly',
],
```

### 5. Monitor Failed Login Attempts

Implement rate limiting and monitoring for:
- Multiple failed password attempts
- Suspicious IP addresses
- Unusual sign-in patterns

---

## Related Documentation

- [Multi-Tenancy →](multi-tenancy.md)
- [GDPR Compliance →](gdpr-compliance.md)
- [Internationalization →](internationalization.md)
