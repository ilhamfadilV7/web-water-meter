import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "iot.lydar.tech",
      },
    ],
  },
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
