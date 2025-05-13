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

module.exports = nextConfig;
