import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.otf'],
  base: '/',
  server: {
    mimeTypes: {
      '.jsx': 'text/javascript'
    },
    historyApiFallback: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});