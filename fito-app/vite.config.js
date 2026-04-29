import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@shared-lib': path.resolve(__dirname, '../shared'),
    },
    dedupe: ['firebase', 'react', 'react-dom', 'framer-motion', 'lottie-react'],
  },
  server: {
    fs: {
      allow: ['..', '../shared']
    }
  },
  optimizeDeps: {
    include: ['framer-motion', 'react', 'react-dom']
  }
})
