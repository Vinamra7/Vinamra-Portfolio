const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {import('next').NextConfig} */
module.exports = (phase) => ({
  reactStrictMode: true,
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
  // Keep production builds separate from the running development preview.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
});
