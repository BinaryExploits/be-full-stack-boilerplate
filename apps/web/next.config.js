/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: () => {
    return [
      {
        source: "/trpc/:path*",
        destination: `${process.env.TRPC_URL}/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${process.env.API_URL}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
