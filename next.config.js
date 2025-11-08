// cspell:ignore turbopack
const nextConfig = /** @type {import('next').NextConfig} */ ({
  turbopack: {
    // Force Turbopack to treat THIS folder as the root, not ~/.
    root: __dirname,
  },
});

module.exports = nextConfig;