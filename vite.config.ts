import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base works with HashRouter on GitHub Pages and locally.
  base: './',
});
