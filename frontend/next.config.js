/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BACKEND_URL || 'http://localhost:8000'}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
