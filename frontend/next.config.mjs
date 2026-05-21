/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // HIGHL-UTILITY PARAMETER: Bypasses ESLint crashes during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
