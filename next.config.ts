import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@anthropic-ai/sdk',
  ],
  outputFileTracingIncludes: {
    '/api/generate': [
      'bin/ffmpeg',
    ],
  },
  outputFileTracingExcludes: {
    '*': [
      '**/node_modules/@ffmpeg-installer/**',
      '**/node_modules/.pnpm/@ffmpeg-installer**',
      '**/node_modules/typescript/**',
      '**/node_modules/eslint/**',
      '**/node_modules/@playwright/**',
      '**/node_modules/@swc/**',
      '**/node_modules/tailwindcss/**',
      '**/node_modules/postcss/**',
    ],
  },
};

export default nextConfig;
