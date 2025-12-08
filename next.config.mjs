/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configure allowed origins for development
  allowedDevOrigins: ['http://10.72.120.243:3000', 'http://localhost:3000', 'http://localhost:3001'],
  // Enable performance optimizations
  compress: true,
  // Optimize react server components
  experimental: {
    optimizeServerReact: true,
    serverMinification: true,
  },
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Reduce bundle size by excluding unused modules
    if (!dev && !isServer) {
      config.optimization.minimize = true;
    }
    
    // Ignore system files that cause Watchpack errors on Windows
    if (process.platform === 'win32') {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/*.log',
          '**/*.tmp',
          '**/System Volume Information',
          '**/DumpStack.log.tmp',
          '**/hiberfil.sys',
          '**/pagefile.sys',
          '**/swapfile.sys'
        ]
      };
    }
    
    return config;
  },
}

export default nextConfig