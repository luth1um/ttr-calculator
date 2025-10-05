import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ttr-calculator/',
  build: {
    outDir: 'dist/timed-automata-analysis',
  },
  server: {
    open: true,
  },
});
