import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
  experimental: {},
  // Allow Sharp as a server-only package
  serverExternalPackages: ["sharp", "bullmq", "ioredis"],
};

export default nextConfig;
