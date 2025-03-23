import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Add this option to help with hydration issues
  experimental: {
    // This helps with hydration issues caused by browser extensions
    optimizeCss: false,
  }
};

export default nextConfig;
