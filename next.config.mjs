import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Allow cross-origin requests from local network and ngrok during development
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['192.168.1.24', 'localhost', '*.ngrok-free.dev', '*.ngrok.io'],
  }),
  // Set turbopack root to this directory to prevent it from traversing up
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
