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
    host: true, // Allow external connections for mobile testing
    port: 3000,
    watch: {
      usePolling: true, // Docker 환경에서 파일 변경 감지를 위해 필요
    },
    hmr: {
      overlay: true, // 에러 오버레이 표시
    }
  }
});