/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for undici module parse error
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Suppress warning about firebase-admin in client-side bundles
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  // Force clean builds
  swcMinify: true,
}

module.exports = nextConfig
