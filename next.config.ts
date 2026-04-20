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
  reactCompiler: true,

  async rewrites() {
    return [
      {
        // GANTI NAMA SUMBERNYA MENJADI INI:
        source: "/api-bridge/:path*",
        destination: "http://127.0.0.1:3130/:path*",
      },
    ];
  },
};

export default nextConfig;
