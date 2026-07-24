import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://suitmedia-backend.suitdev.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
      },
      '/cdn': {
        target: 'https://assets.suitdev.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/cdn/, ''),
      },
    },
  },
});
