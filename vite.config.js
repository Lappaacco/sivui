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
        thankyou: './thank-you.html'
      }
    }
  }
});