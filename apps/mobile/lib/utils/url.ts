import { Platform } from "react-native";
import { StringExtensions } from "@repo/utils-core";

/**
 * Returns the frontend base URL as-is (no trailing slash).
 */
// TODO: MAKE SONARQUBE HAPPY
export function getFrontendBaseUrl(): string {
  let baseUrl: string;
  if (Platform.OS === "web") {
    baseUrl = process.env.EXPO_PUBLIC_WEB_URL?.replace(/\/+$/, "") || "";
  } else {
    baseUrl = process.env.EXPO_PUBLIC_APP_URL!;
  }

  return baseUrl;
}

export function getApiUrl(): string {
  let baseUrl: string;
  if (Platform.OS === "android") {
    baseUrl = process.env.EXPO_PUBLIC_API_URL_ANDROID!;
  } else {
    baseUrl = process.env.EXPO_PUBLIC_API_URL!;
  }

  return baseUrl.replace(/\/+$/, "");
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
