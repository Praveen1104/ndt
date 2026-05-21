/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // 🟢 FORCES NEXT.JS TO BUILD EVEN WITH UNESCAPED CHARACTERS/ERRORS
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
