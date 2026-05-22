import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outExtension: () => ({ js: '.mjs' }),
  dts: false,
  sourcemap: true,
  clean: true,
  target: 'es2022',
});
