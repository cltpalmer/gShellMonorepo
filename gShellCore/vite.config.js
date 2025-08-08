// gShellMonorepo/gShellCore/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'), // ⬅️ was '../../shared'
    },
  },
  server: {
    fs: {
      allow: ['..', '../shared'], // ⬅️ match the real path
    },
  },
})
