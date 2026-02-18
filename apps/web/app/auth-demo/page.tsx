"use client";

import dynamic from "next/dynamic";
import { AuthDemoLoadingShell } from "./AuthDemoLoadingShell";

const AuthDemoClient = dynamic(
  () => import("./AuthDemoClient").then((m) => m.default),
  {
    ssr: false,
    loading: () => <AuthDemoLoadingShell />,
  },
);

/**
 * Auth demo page: client-only to avoid hydration mismatch from auth/session state
 * differing between server and client. Callback URLs use window.location.origin.
 */
export default function AuthDemoPage() {
  return <AuthDemoClient />;
}
