import type {NextConfig} from 'next';
import withPWAInit from "@ducanh2912/next-pwa";

const isDevelopment = process.env.NODE_ENV === 'development';

const withPWA = withPWAInit({
  dest: "public",
  disable: isDevelopment,
  register: true,
  skipWaiting: true,
  // extendDefaultRuntimeCaching: true, // Consider enabling for more aggressive caching
  // workboxOptions: { // Advanced Workbox options if needed
  //   maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  // },
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
