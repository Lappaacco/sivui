import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite-konfiguraatio. base-asetus "./" auttaa suhteellisten linkkien toimimisessa
// GitHub Pagesilla. Lisää mukaan React-plugin.
export default defineConfig({
  plugins: [react()],
  base: './',
});