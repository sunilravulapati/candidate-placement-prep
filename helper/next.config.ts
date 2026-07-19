// next.config.ts
import type { NextConfig } from "next";
import path from "path";
import { config as loadEnv } from "dotenv";

// Next runs from helper/, while the server package owns the integration credentials.
loadEnv({ path: path.resolve(__dirname, '../backend/.env'), override: false, quiet: true });

const nextConfig: NextConfig = {
  transpilePackages: ["backend", "react-resizable-panels"],
  serverExternalPackages: ["unpdf"],
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@backend': path.resolve(__dirname, '../backend/src')
      },
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: '/resume-ai',
        destination: '/resume-studio',
        permanent: true,
      },
      {
        source: '/resume-tailoring',
        destination: '/resume-studio',
        permanent: true,
      },
      {
        source: '/questions',
        destination: '/dsa/library',
        permanent: true,
      },
      {
        source: '/live-coding',
        destination: '/dsa',
        permanent: true,
      },
      {
        source: '/live-coding/:path*',
        destination: '/dsa/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
