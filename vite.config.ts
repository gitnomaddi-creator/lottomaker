import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: [
        '/',
        '/about',
        '/faq',
        '/privacy',
        '/terms',
        '/stats',
        '/results',
        '/saju',
        '/contact'
      ],
      renderer: new PuppeteerRenderer({
        maxConcurrentRoutes: 1,
        renderAfterDocumentEvent: 'render-ready',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }),
      postProcess(renderedRoute) {
        // inject 스크립트 제거
        renderedRoute.html = renderedRoute.html
          .replace(/<script[^>]*data-prerender[^>]*>.*?<\/script>/gs, '')
      }
    })
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
