import type { NextConfig } from 'next';

const proxyTarget = process.env.API_PROXY_TARGET;

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${proxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
