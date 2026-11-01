/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

module.exports = nextConfig;
