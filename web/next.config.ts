import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Type checking runs as a separate CI step; this avoids a Next/Turbopack
  // `tsc --showConfig` subprocess issue in restricted build environments.
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
