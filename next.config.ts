import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'fmwjecuufzgvcdhwvhnx.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'dfobafisriiwryfbmtfb.supabase.co',
      },
    ],
  },
};

export default nextConfig;
