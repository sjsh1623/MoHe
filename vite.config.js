// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// ESM 환경에서 __dirname 을 사용할 수 있게 변환해 주는 코드
import { fileURLToPath, URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    host: '0.0.0.0', // Allow external connections for mobile testing and Docker
    port: 3000,
    strictPort: true, // Fail if port is already in use
    allowedHosts: [
      'mohe.today',
      '.mohe.today', // Include all subdomains
      'mohe-react-dev', // Allow Docker internal hostname
      'localhost',
      '127.0.0.1'
    ],
    watch: {
      usePolling: true, // Docker 환경에서 파일 변경 감지를 위해 필요
      interval: 100, // 폴링 간격 (ms)
    },
    hmr: {
      protocol: 'ws',
      host: '0.0.0.0', // Mobile 접근을 위해 0.0.0.0 사용
      port: 3000,
      overlay: true,
    },
    // MIME type 명시적 설정
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    }
  }
});