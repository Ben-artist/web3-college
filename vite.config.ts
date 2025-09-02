import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: "copy-headers",
    writeBundle() {
      try {
        const fs = require('fs')
        fs.copyFileSync('_headers', 'dist/_headers')
      } catch (e) {
        console.log('_headers file not found, skipping...')
      }
    }
  }],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // 关闭sourcemap以减少文件大小
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wagmi: ['wagmi', 'viem'],
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './', // 使用相对路径
})
