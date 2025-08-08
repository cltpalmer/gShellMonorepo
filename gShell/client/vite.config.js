import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared'), // ✅ shared shortcut
    },
  },
  server: {
    fs: {
      // ✅ allow importing from the monorepo root
      allow: ['..', '../../shared']
    }
  },
});
