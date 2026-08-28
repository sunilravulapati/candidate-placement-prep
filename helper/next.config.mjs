// next.config.mjs
import path from "path";
import { fileURLToPath } from "url";
import { config as loadEnv } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Next runs from helper/, while the server package owns the integration credentials.
loadEnv({ path: path.resolve(__dirname, '../backend/.env'), override: false, quiet: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["backend", "react-resizable-panels"],
  serverExternalPackages: ["unpdf"],
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack disk caching in development on Windows to prevent stale chunk corruption & file-lock rename errors
      config.cache = false;
    }
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
