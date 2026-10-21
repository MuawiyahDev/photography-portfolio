/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional override so verification/prod test builds can write to a
  // separate directory (NEXT_DIST_DIR=.next-verify). Without it, a
  // `next build` clobbers the chunks a running `next dev` is still
  // referencing → "Cannot find module './897.js'" until restart.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
