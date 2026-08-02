import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Project site: https://SRP1357.github.io/ear-training-app/
  base: '/ear-training-app/',
});
