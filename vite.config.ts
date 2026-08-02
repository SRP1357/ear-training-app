import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Absolute base so clean BrowserRouter URLs and OG assets resolve on GitHub Pages.
  base: '/ear-training-app/',
});
