import { StringExtensions } from "@repo/utils-core";

export function getFrontendUrl(): string {
  return process.env.NEXT_PUBLIC_FRONTEND_URL || "";
}

export function getJoinedFrontendUrl(path: string): string {
  const base: string = getFrontendUrl();
  if (StringExtensions.IsNullOrEmpty(base)) {
    return base;
  }

  return base + (path.startsWith("/") ? path : "/" + path);
}
