import { Platform } from "react-native";
import { StringExtensions } from "@repo/utils-core";
import { AppConstants } from "@/constants/app";

export function getFrontendUrl(): string {
  let baseUrl: string;
  if (Platform.OS === "web") {
    baseUrl = process.env.EXPO_PUBLIC_WEB_URL || "";
  } else {
    baseUrl = AppConstants.scheme + "://";
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

  return baseUrl;
}

export function getJoinedFrontendUrl(path: string): string {
  const base: string = getFrontendUrl();
  if (StringExtensions.IsNullOrEmpty(base)) {
    return base;
  }

  return base + (path.startsWith("/") ? path : "/" + path);
}
