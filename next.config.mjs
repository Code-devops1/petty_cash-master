/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,  // Enable ESLint during builds to catch errors early
  },
  typescript: {
    ignoreBuildErrors: false,  // Enable TS errors during builds to catch errors early
  },
  images: {
    unoptimized: false,  // Allow image optimization in production
  },
  // Remove development-specific origins
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
    // Only apply Windows-specific ignores when on Windows
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