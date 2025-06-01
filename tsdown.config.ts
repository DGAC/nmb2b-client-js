import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/config.ts',
    'src/security.ts',
    'src/Airspace/index.ts',
    'src/Flight/index.ts',
    'src/Flow/index.ts',
    'src/GeneralInformation/index.ts',
    'src/PublishSubscribe/index.ts',
    'src/utils/index.ts',
    'src/Airspace/types.ts',
    'src/Flight/types.ts',
    'src/Flow/types.ts',
    'src/GeneralInformation/types.ts',
    'src/PublishSubscribe/types.ts',
  ],
  sourcemap: true,
  outDir: 'dist',
});
