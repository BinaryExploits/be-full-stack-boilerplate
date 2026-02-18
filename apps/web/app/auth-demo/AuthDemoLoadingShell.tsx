/**
 * Single loading shell for auth-demo. Used by the dynamic import and by
 * AuthDemoClient so server and client never render different markup (avoids hydration mismatch).
 */
export function AuthDemoLoadingShell() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div
          className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-b-gray-900 border-transparent"
          aria-hidden
        />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
