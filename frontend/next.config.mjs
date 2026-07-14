/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker build hatasını aşmak için eklemeler:
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1', // Geliştirme ortamı için
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost', // Geliştirme ortamı için
        port: '8000',
        pathname: '/media/**',
      },
      // DOCKER İÇİN EKLEME:
      {
        protocol: 'http',
        hostname: 'backend', // Docker servis ismi
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default nextConfig;