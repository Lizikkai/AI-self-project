import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
  ],
  server: {
    port:8080,
    proxy: {
      '/api': {
        target: "http://localhost:14258",
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    cors: true,
  },
  resolve: {
    alias: {
      '@/views': resolve(__dirname, '.', 'src/views'),
      '@/utils': resolve(__dirname, '.','src/utils'),
      '@/api': resolve(__dirname, '.','src/api'),
      '@/store': resolve(__dirname, '.','src/store'),
      '@/router': resolve(__dirname, '.','src/router'),
      '@/components': resolve(__dirname, '.','src/components'),
    },
  },
})
