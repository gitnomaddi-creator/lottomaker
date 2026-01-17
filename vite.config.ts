import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/lotto-api': {
        target: 'https://www.dhlottery.co.kr',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/lotto-api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          fortunes: ['./src/data/fortunes.json']
        }
      }
    }
  }
})
