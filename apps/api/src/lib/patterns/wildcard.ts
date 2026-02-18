/**
 * Matches an origin string against a single wildcard pattern.
 *
 * Rules:
 *   - `*` matches any sequence of characters (including none)
 *   - Matching is case-insensitive
 *   - No `*` → exact match required
 *
 * Examples:
 *   matchesWildcard('http://localhost:3000',     'http://localhost:*')       // true
 *   matchesWildcard('http://abc.localhost:3000', 'http://*.localhost:*')     // true
 *   matchesWildcard('https://app.example.com',   'https://*.example.com')   // true
 *   matchesWildcard('https://example.com',       'https://example.com')     // true
 *   matchesWildcard('https://evil.com',          'https://example.com')     // false
 */
export const matchesWildcard = (origin: string, pattern: string): boolean => {
  const o = origin.toLowerCase();
  const segments = pattern.toLowerCase().split('*');

  // No wildcard — require exact match
  if (segments.length === 1) return o === segments[0];

  // The origin must start with whatever comes before the first *
  if (!o.startsWith(segments[0])) return false;

  let pos = segments[0].length;

  // Each middle segment must appear in order after the previous match
  for (let i = 1; i < segments.length - 1; i++) {
    const idx = o.indexOf(segments[i], pos);
    if (idx === -1) return false;
    pos = idx + segments[i].length;
  }

  // The origin must end with whatever comes after the last *
  // pos <= o.length - tail.length ensures prefix and suffix don't overlap
  const tail = segments.at(-1)!;
  return o.endsWith(tail) && pos <= o.length - tail.length;
};
