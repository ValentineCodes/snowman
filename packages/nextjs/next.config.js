// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  env:{
    NEXT_PUBLIC_ALCHEMY_API_KEY: "JLtJ9Rnwhy0MrOLyTQtYyjQPb63cGVx"
  }
};

module.exports = nextConfig;
