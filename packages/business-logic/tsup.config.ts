import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outExtension: () => ({ js: '.mjs' }),
  // This package already exposes its TypeScript source through the `types`
  // condition. Bundling the entire public API into a single declaration file
  // exhausts tsup's worker heap, so the production build only emits runtime
  // artifacts while consumers resolve types from src/index.ts.
  dts: false,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  // Keep every workspace package external. Besides avoiding duplicate runtime
  // bundles, this prevents tsup's declaration worker from recursively bundling
  // the complete type graphs of foundation and security (which exhausted the
  // worker heap in production builds).
  external: [
    '@hlb/contracts',
    '@hlb/security',
    '@hlb/constant-definitions',
    '@hlb/foundation',
  ],
});
