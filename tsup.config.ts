import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  // tsup's CSS plugin applies the '.css' loader to every stylesheet, so a
  // '.module.css' key is ignored. The only CSS imported from TS is module
  // CSS anyway; tokens.css is copied as-is in onSuccess.
  loader: {
    '.css': 'local-css',
  },
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  async onSuccess() {
    await copyFile('src/styles/tokens.css', 'dist/tokens.css');
  },
});
