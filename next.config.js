/** @type {import('next').NextConfig} */
const nextConfig = {
   webpack: (config) => {
      config.module.rules.push({
         test: /\.webm$/,
         type: 'asset/resource',
      });

      return config;
   },
};

module.exports = nextConfig;
