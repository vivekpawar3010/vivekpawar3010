/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
