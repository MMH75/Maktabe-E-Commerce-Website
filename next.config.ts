import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Admin panel image uploads (max 5 MB, see src/lib/storage.ts) plus form fields
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
