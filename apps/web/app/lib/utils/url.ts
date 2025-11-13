import { StringExtensions } from "@repo/utils-core";

/**
 * Returns the frontend base URL as-is (no trailing slash).
 */
// TODO: MAKE SONARQUBE HAPPY
export function getFrontendBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "";
}

/**
 * Returns the frontend base URL joined with the given relative path.
 * Example: getJoinedFrontendUrl('/auth/callback') -> 'https://myapp.com/auth/callback'
 */
export function getJoinedFrontendUrl(path: string): string {
  const base: string = getFrontendBaseUrl();
  if (StringExtensions.IsNullOrEmpty(base)) {
    return base;
  }

  return base + (path.startsWith("/") ? path : "/" + path);
}
