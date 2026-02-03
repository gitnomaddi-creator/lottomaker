import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 코어 분리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 큰 라이브러리 분리
          'html2canvas': ['html2canvas'],
          // 운세 데이터 분리 (lazy loading)
          'fortunes': ['./src/data/fortunes.json']
        }
      }
    }
  }
})
