import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/utils/index.ts',
    'src/types.ts',
    'src/security.ts',
    'src/config.ts',
  ],
  target: 'node20',
  clean: true,
  sourcemap: true,
  dts: true,
  outDir: 'dist',
  unbundle: true,
});
