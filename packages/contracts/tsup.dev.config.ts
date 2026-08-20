import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/constants.ts'],
  format: ['esm'],
  outExtension: () => ({ js: '.mjs' }),
  dts: false,
  sourcemap: true,
  clean: true,
  target: 'es2022',
});
