import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite-konfiguraatio GitHub Pagesille
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        privacy: './privacy.html',
        privacysv: './privacy-sv.html',
        privacyen: './privacy-en.html',
        thankyou: './thank-you.html',
        selfmonitoring: './self-monitoring.html',
        selfmonitoringsv: './self-monitoring-sv.html',
        selfmonitoringen: './self-monitoring-en.html'
      }
    }
  }
});