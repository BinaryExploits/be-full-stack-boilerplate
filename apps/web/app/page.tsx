import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-2xl">BE</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Full Stack Boilerplate
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            NextJs (Tailwind CSS), NestJs, Expo, tRPC, Better Auth
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/crud-demo">
            <div className="group bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7h16M4 12h16M4 17h16"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">CRUD Demo</h2>
              </div>
              <p className="text-slate-400 mb-6">
                Test Create, Read, Update, Delete operations with tRPC and
                Prisma integration. Full-stack type safety demonstration.
              </p>
              <div className="flex items-center text-blue-400 font-medium group-hover:gap-3 gap-2 transition-all">
                <span>Try it out</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/auth-demo">
            <div className="group bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-green-500 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Auth Demo</h2>
              </div>
              <p className="text-slate-400 mb-6">
                Test authentication with Better Auth. OAuth integration with
                Google, session management, and protected routes.
              </p>
              <div className="flex items-center text-green-400 font-medium group-hover:gap-3 gap-2 transition-all">
                <span>Try it out</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            Built with modern tools for rapid development
          </p>
        </div>
      </div>
    </main>
  );
}
