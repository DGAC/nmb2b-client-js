import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/security.ts',
    'src/Airspace/index.ts',
    'src/Flight/index.ts',
    'src/Flow/index.ts',
    'src/GeneralInformation/index.ts',
    'src/PublishSubscribe/index.ts',
    'src/Airspace/types.ts',
    'src/Flight/types.ts',
    'src/Flow/types.ts',
    'src/GeneralInformation/types.ts',
    'src/PublishSubscribe/types.ts',
  ],
  sourcemap: true,
  clean: true,
  target: 'node16',
  dts: true,
  outDir: 'dist',
  splitting: false,
  format: ['cjs', 'esm'],
});
