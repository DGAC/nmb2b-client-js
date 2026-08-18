import { registerFixtures } from '../../tests/utils/runner.ts';
import { describe } from 'vitest';

describe('Flow Fixtures', async () => {
  await registerFixtures('./__fixtures__/*.ts', import.meta.url);
});
