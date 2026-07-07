// next.config.ts
import type { NextConfig } from "next";
import path from "path";
import { config as loadEnv } from "dotenv";

// Next runs from helper/, while the server package owns the integration credentials.
loadEnv({ path: path.resolve(__dirname, '../backend/.env'), override: false, quiet: true });

const nextConfig: NextConfig = {
  transpilePackages: ["backend"],
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': '.',
        '@/components': './components',
        '@/lib': './lib',
        '@/app': './app',
        '@backend': path.resolve(__dirname, '../backend/src')
      },
    };
    return config;
  },
};

export default nextConfig;
