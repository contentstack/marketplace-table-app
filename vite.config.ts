import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      assets: resolve(__dirname, 'src/assets'),
      common: resolve(__dirname, 'src/common'),
      components: resolve(__dirname, 'src/components'),
      containers: resolve(__dirname, 'src/containers'),
      hooks: resolve(__dirname, 'src/hooks'),
      pages: resolve(__dirname, 'src/pages'),
      routes: resolve(__dirname, 'src/routes'),
      styles: resolve(__dirname, 'src/styles'),
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
});

