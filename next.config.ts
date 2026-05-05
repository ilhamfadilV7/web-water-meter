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
      // {
      //   // Dev
      //   source: "/api-bridge/:path*",
      //   destination: "http://10.20.10.187:3130/:path*",
      // },
      {
        // Prod
        source: "/api-bridge/:path*",
        destination: "http://127.0.0.1:3000/:path*",
      },
    ];
  },
};

export default nextConfig;
