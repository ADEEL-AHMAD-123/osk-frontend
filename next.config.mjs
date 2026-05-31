import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Compile SCSS @use paths without long relative chains.
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'src/styles')],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    /* Hosts the <Image> loader is allowed to fetch from.
     * `res.cloudinary.com`   — CDN media (MEDIA_PROVIDER=cloudinary)
     * `images.unsplash.com`  — seed/sample property photos
     * `*.up.railway.app`     — local-disk uploads served from the Railway
     *                          backend until Cloudinary is enabled. Add
     *                          your custom backend domain here too once
     *                          you attach one. */
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.up.railway.app' },
      { protocol: 'https', hostname: '*.railway.app' },
    ],
  },
  // Keep dev memory/CPU low: do not bundle heavy libs into the server graph.
  experimental: {
    optimizePackageImports: ['framer-motion', 'maplibre-gl'],
  },
  async headers() {
    return [
      {
        // Public, cacheable GET pages — tune per route as needed.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
