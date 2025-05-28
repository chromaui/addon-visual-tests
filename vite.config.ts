import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

const CHROMATIC_BASE_URL = process.env.CHROMATIC_BASE_URL || 'https://www.chromatic.com';

// https://vitejs.dev/config/
export default defineConfig({
  define: { 'process.env': { CHROMATIC_BASE_URL } },
  plugins: [react(), EnvironmentPlugin({ CHROMATIC_BASE_URL })],
  coverage: {
    provider: 'v8',
  },
});
