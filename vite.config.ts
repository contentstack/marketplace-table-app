import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { resolve } from "path";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: "named",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      assets: resolve(__dirname, "src/assets"),
      common: resolve(__dirname, "src/common"),
      components: resolve(__dirname, "src/components"),
      containers: resolve(__dirname, "src/containers"),
      hooks: resolve(__dirname, "src/hooks"),
      pages: resolve(__dirname, "src/pages"),
      routes: resolve(__dirname, "src/routes"),
      styles: resolve(__dirname, "src/styles"),
    },
  },
  build: {
    outDir: "build",
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
  test: {
    environment: "jsdom",
    setupFiles: ["src/setupTests.ts"],
    include: ["src/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.spec.{ts,tsx}", "src/**/*.d.ts", "src/setupTests.ts", "src/test-utils/**"],
      // Measured floor (97.46 / 93.09 / 97.71 / 97.61), rounded down; all above 90, so no ratchet is needed.
      thresholds: { lines: 97, branches: 93, functions: 97, statements: 97 },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
});
