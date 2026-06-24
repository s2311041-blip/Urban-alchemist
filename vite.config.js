import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  // スマホから AR（カメラ・コンパス）を試すには HTTPS 必須
  plugins: [react(), basicSsl()],
  server: {
    // 同一 Wi‑Fi 内のスマホからアクセス可能にする（localhost だけだとスマホから届かない）
    host: true,
    port: 5173,
    proxy: {
      '/ar-api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ar-api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ar: resolve(__dirname, 'ar.html'),
      },
    },
  },
})
