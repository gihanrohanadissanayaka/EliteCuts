import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom', 'react-router-dom'],
          'form-vendor':   ['react-hook-form', '@hookform/resolvers', 'yup'],
          'ui-vendor':     ['react-datepicker', 'react-hot-toast', 'lucide-react'],
          'http-vendor':   ['axios'],
        },
      },
    },
  },
});
