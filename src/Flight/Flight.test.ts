import { describe } from 'vitest';
import { registerFixtures } from '../../tests/utils/runner.ts';

describe('Flight Fixtures', async () => {
  await registerFixtures('./__fixtures__/*.ts', import.meta.url);
});
