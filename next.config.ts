import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // Change to false to reduce double-rendering in development
  // Add this option to help with hydration issues
  experimental: {
    // This helps with hydration issues caused by browser extensions
    optimizeCss: false,
    // Suppress hydration warnings
    suppressHydrationWarning: true,
  },
  // Suppress hydration warnings
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  }
};

export default nextConfig;
