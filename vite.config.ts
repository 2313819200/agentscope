import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3333,
    proxy: {
      '/api/openclaw': {
        target: 'http://localhost:1177',
        changeOrigin: true,
        rewrite: (p) => p.replace('/api/openclaw', ''),
        ws: true,
      },
    },
  },
});
