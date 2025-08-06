import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
console.log('Terminal alias resolves to:', path.resolve(__dirname, '../../../../shared'));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port:5173,
  },

resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared') // 👈 This line adds the alias
    }
  }
})

