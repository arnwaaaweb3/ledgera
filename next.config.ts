import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Membunuh warning "slow filesystem detected" di monorepo
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        // Ignore node_modules dan folder package lain di monorepo kamu
        ignored: [
          '**/node_modules/**',
          '**/packages/**', // <-- Sesuaikan dengan nama folder workspace kamu
          '**/apps/**',    // <-- Sesuaikan dengan nama folder workspace kamu
        ],
        // Pastikan polling mati agar tidak membebani CPU
        poll: false, 
      };
    }
    return config;
  },
};

export default nextConfig;