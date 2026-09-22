/** @type {import('next').NextConfig} */
const nextConfig = {
   webpack: (config) => {
      config.module.rules.push({
         test: /\.webm$/,
         type: 'asset/resource',
      });

      return config;
   },
   // Add image optimization
   images: {
      domains: ['lmiwzoiohfrsxaidpyfb.supabase.co'],
      formats: ['image/webp'],
   },
   // Add build optimizations
   compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
   },
   reactStrictMode: true,
};

// Keep the live preview separate from production builds.
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
module.exports = (phase) => ({
   ...nextConfig,
   distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
});
