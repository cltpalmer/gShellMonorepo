import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 👈 Required for path.resolve

export default defineConfig({
  plugins: [react()],
  server: {
    port:5175,
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared') // 👈 This line adds the alias
    }
  }
})
