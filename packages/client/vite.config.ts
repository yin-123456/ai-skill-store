import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const copyIndexTo404 = () => ({
  name: 'copy-index-to-404',
  closeBundle() {
    const dist = path.resolve(__dirname, 'dist');
    if (fs.existsSync(path.join(dist, 'index.html'))) {
      fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
    }
  },
});

export default defineConfig({
  plugins: [react(), copyIndexTo404()],
  base: '/ai-skill-store/',
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
