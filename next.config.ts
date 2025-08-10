import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Change to false to reduce double-rendering in development
  experimental: {
    optimizeCss: false,
  },
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  images: {
    unoptimized: true, // Disable image optimization to avoid hydration issues
  },
};

export default nextConfig;

