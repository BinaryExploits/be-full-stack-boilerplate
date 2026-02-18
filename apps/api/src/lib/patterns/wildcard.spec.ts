import { matchesWildcard } from './wildcard';

// The exact patterns used in BETTER_AUTH_TRUSTED_ORIGINS / CORS_ORIGINS
const ALLOWED_PATTERNS = {
  localhost: 'http://localhost:*',
  localhostSub: 'http://*.localhost:*',
  binaryexports: 'https://binaryexports.com',
  binaryexportsSub: 'https://*.binaryexports.com',
  binaryexploits: 'https://binaryexploits.com',
  binaryexploitsSub: 'https://*.binaryexploits.com',
  binaryexperiments: 'https://binaryexperiments.com',
  binaryexperimentsSub: 'https://*.binaryexperiments.com',
};

// Helper: asserts that the origin matches at least one of the given patterns
const allowed = (origin: string, patterns: string[]): boolean =>
  patterns.some((p) => matchesWildcard(origin, p));

// ---------------------------------------------------------------------------
// Unit tests for matchesWildcard itself
// ---------------------------------------------------------------------------

describe('matchesWildcard – core logic', () => {
  describe('exact match (no wildcard)', () => {
    it('matches identical strings', () => {
      expect(
        matchesWildcard('https://example.com', 'https://example.com'),
      ).toBe(true);
    });

    it('rejects a different string', () => {
      expect(matchesWildcard('https://other.com', 'https://example.com')).toBe(
        false,
      );
    });

    it('is case-insensitive', () => {
      expect(
        matchesWildcard('HTTPS://EXAMPLE.COM', 'https://example.com'),
      ).toBe(true);
    });

    it('rejects a prefix-only match', () => {
      expect(
        matchesWildcard('https://example.com.evil.com', 'https://example.com'),
      ).toBe(false);
    });

    it('rejects a suffix-only match', () => {
      expect(
        matchesWildcard('https://evil.example.com', 'https://example.com'),
      ).toBe(false);
    });
  });

  describe('trailing wildcard  (pattern: prefix*)', () => {
    it('matches anything after the prefix', () => {
      expect(
        matchesWildcard('http://localhost:3000', 'http://localhost:*'),
      ).toBe(true);
      expect(
        matchesWildcard('http://localhost:8080', 'http://localhost:*'),
      ).toBe(true);
      expect(
        matchesWildcard('http://localhost:4000', 'http://localhost:*'),
      ).toBe(true);
    });

    it('matches when * expands to empty string', () => {
      expect(matchesWildcard('http://localhost:', 'http://localhost:*')).toBe(
        true,
      );
    });

    it('rejects a different prefix', () => {
      expect(
        matchesWildcard('http://notlocalhost:3000', 'http://localhost:*'),
      ).toBe(false);
    });
  });

  describe('leading wildcard  (pattern: *suffix)', () => {
    it('matches anything before the suffix', () => {
      expect(
        matchesWildcard(
          'https://app.binaryexports.com',
          'https://*.binaryexports.com',
        ),
      ).toBe(true);
      expect(
        matchesWildcard(
          'https://www.binaryexports.com',
          'https://*.binaryexports.com',
        ),
      ).toBe(true);
    });

    it('rejects when suffix is absent', () => {
      expect(
        matchesWildcard(
          'https://binaryexports.evil.com',
          'https://*.binaryexports.com',
        ),
      ).toBe(false);
    });
  });

  describe('multiple wildcards  (pattern: prefix*middle*suffix)', () => {
    it('matches with both wildcards expanding', () => {
      expect(
        matchesWildcard('http://abc.localhost:3000', 'http://*.localhost:*'),
      ).toBe(true);
    });

    it('matches when first * is empty and second expands', () => {
      // .localhost:3000 — first * is empty, second is '3000'
      expect(
        matchesWildcard('http://.localhost:3000', 'http://*.localhost:*'),
      ).toBe(true);
    });

    it('rejects when the middle segment is missing', () => {
      expect(matchesWildcard('http://abc3000', 'http://*.localhost:*')).toBe(
        false,
      );
    });
  });

  describe('non-overlap guard', () => {
    it('rejects when prefix and suffix would overlap', () => {
      // pattern a*a requires at least 2 chars; 'a' alone should not match
      expect(matchesWildcard('a', 'a*a')).toBe(false);
    });

    it('accepts the minimal non-overlapping case', () => {
      // 'aa' satisfies a*a with * = ''
      expect(matchesWildcard('aa', 'a*a')).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Pattern-level tests – each pattern from our env
// ---------------------------------------------------------------------------

describe('CORS patterns – valid origins (must ALLOW)', () => {
  describe('http://localhost:*', () => {
    const p = ALLOWED_PATTERNS.localhost;
    it.each([
      'http://localhost:3000',
      'http://localhost:4000',
      'http://localhost:8080',
      'http://localhost:80',
    ])('allows %s', (origin) => {
      expect(matchesWildcard(origin, p)).toBe(true);
    });
  });

  describe('http://*.localhost:*', () => {
    const p = ALLOWED_PATTERNS.localhostSub;
    it.each([
      'http://abc.localhost:3000',
      'http://binaryexports.localhost:3000',
      'http://binaryexploits.localhost:3000',
      'http://binaryexperiments.localhost:3000',
      'http://tenant-1.localhost:8080',
    ])('allows %s', (origin) => {
      expect(matchesWildcard(origin, p)).toBe(true);
    });
  });

  describe('https://binaryexports.com (exact)', () => {
    const p = ALLOWED_PATTERNS.binaryexports;
    it('allows the apex domain', () => {
      expect(matchesWildcard('https://binaryexports.com', p)).toBe(true);
    });
  });

  describe('https://*.binaryexports.com', () => {
    const p = ALLOWED_PATTERNS.binaryexportsSub;
    it.each([
      'https://www.binaryexports.com',
      'https://app.binaryexports.com',
      'https://api.binaryexports.com',
      'https://tenant1.binaryexports.com',
    ])('allows %s', (origin) => {
      expect(matchesWildcard(origin, p)).toBe(true);
    });
  });

  describe('https://binaryexploits.com (exact)', () => {
    it('allows the apex domain', () => {
      expect(
        matchesWildcard(
          'https://binaryexploits.com',
          ALLOWED_PATTERNS.binaryexploits,
        ),
      ).toBe(true);
    });
  });

  describe('https://*.binaryexploits.com', () => {
    const p = ALLOWED_PATTERNS.binaryexploitsSub;
    it.each([
      'https://www.binaryexploits.com',
      'https://app.binaryexploits.com',
    ])('allows %s', (origin) => {
      expect(matchesWildcard(origin, p)).toBe(true);
    });
  });

  describe('https://binaryexperiments.com (exact)', () => {
    it('allows the apex domain', () => {
      expect(
        matchesWildcard(
          'https://binaryexperiments.com',
          ALLOWED_PATTERNS.binaryexperiments,
        ),
      ).toBe(true);
    });
  });

  describe('https://*.binaryexperiments.com', () => {
    const p = ALLOWED_PATTERNS.binaryexperimentsSub;
    it.each([
      'https://www.binaryexperiments.com',
      'https://app.binaryexperiments.com',
    ])('allows %s', (origin) => {
      expect(matchesWildcard(origin, p)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Combined pattern set – real-world origins checked against all patterns at once
// Verifies that apex domains, www, and arbitrary subdomains are ALL allowed.
// ---------------------------------------------------------------------------

describe('CORS patterns – combined (apex + www + subdomains must all ALLOW)', () => {
  const allPatterns = Object.values(ALLOWED_PATTERNS);

  describe('binaryexports.com', () => {
    it.each([
      'https://binaryexports.com',
      'https://www.binaryexports.com',
      'https://app.binaryexports.com',
      'https://api.binaryexports.com',
      'https://tenant1.binaryexports.com',
    ])('allows %s', (origin) => {
      expect(allowed(origin, allPatterns)).toBe(true);
    });
  });

  describe('binaryexploits.com', () => {
    it.each([
      'https://binaryexploits.com',
      'https://www.binaryexploits.com',
      'https://app.binaryexploits.com',
    ])('allows %s', (origin) => {
      expect(allowed(origin, allPatterns)).toBe(true);
    });
  });

  describe('binaryexperiments.com', () => {
    it.each([
      'https://binaryexperiments.com',
      'https://www.binaryexperiments.com',
      'https://app.binaryexperiments.com',
    ])('allows %s', (origin) => {
      expect(allowed(origin, allPatterns)).toBe(true);
    });
  });

  describe('localhost', () => {
    it.each([
      'http://localhost:3000',
      'http://localhost:8080',
      'http://binaryexports.localhost:3000',
      'http://binaryexploits.localhost:3000',
      'http://binaryexperiments.localhost:3000',
    ])('allows %s', (origin) => {
      expect(allowed(origin, allPatterns)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Origins that must NOT match any pattern
// ---------------------------------------------------------------------------

describe('CORS patterns – invalid / malicious origins (must DENY)', () => {
  const allPatterns = Object.values(ALLOWED_PATTERNS);

  describe('wrong protocol', () => {
    it.each([
      ['https://localhost:3000', 'localhost pattern only covers http'],
      ['http://binaryexports.com', 'production patterns only cover https'],
      [
        'http://app.binaryexports.com',
        'production subdomain only covers https',
      ],
    ])('denies %s (%s)', (origin) => {
      expect(allowed(origin, allPatterns)).toBe(false);
    });
  });

  describe('subdomain patterns must not match the apex', () => {
    // The apex is covered by its own exact-match pattern, not the subdomain wildcard —
    // but it still appears in allPatterns, so we test the wildcard pattern in isolation.
    it('https://*.binaryexports.com does not match https://binaryexports.com', () => {
      expect(
        matchesWildcard(
          'https://binaryexports.com',
          ALLOWED_PATTERNS.binaryexportsSub,
        ),
      ).toBe(false);
    });
  });

  describe('completely unrelated domains', () => {
    it.each([
      'https://evil.com',
      'http://evil.com',
      'https://notbinaryexports.com',
      'https://google.com',
      'http://notlocalhost:3000',
    ])('denies %s', (origin) => {
      expect(allowed(origin, allPatterns)).toBe(false);
    });
  });

  describe('suffix / prefix injection attacks', () => {
    it.each([
      // Appending the real domain after a dot — should not match
      [
        'https://binaryexports.com.evil.com',
        '*.binaryexports.com should not match when evil.com is the real TLD',
      ],
      [
        'https://evil.binaryexports.com.evil.com',
        'evil suffix must be rejected',
      ],
      // Fake domain that merely contains the real name as a substring
      [
        'https://fakebinaryexports.com',
        'no dot before binaryexports means it is a different name',
      ],
      ['https://notbinaryexploits.com', 'different name entirely'],
    ])('denies %s (%s)', (origin) => {
      expect(allowed(origin, allPatterns)).toBe(false);
    });
  });

  describe('localhost impersonation', () => {
    it.each([
      // Name contains "localhost" but isn't localhost
      'http://evilocalhost:3000',
      'http://notlocalhost:3000',
      // localhost with a suffix (different host)
      'http://localhost.evil.com:3000',
    ])('denies %s', (origin) => {
      expect(allowed(origin, allPatterns)).toBe(false);
    });
  });

  describe('empty / blank origin', () => {
    it('denies empty string', () => {
      expect(allowed('', allPatterns)).toBe(false);
    });
  });
});
