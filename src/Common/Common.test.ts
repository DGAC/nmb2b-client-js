/// <reference types="vite/client" />
import { registerFixtures } from '../../tests/utils/runner.ts';
import { describe } from 'vitest';

describe('Common Fixtures', async () => {
  const fixtures = import.meta.glob('./__fixtures__/*.ts', {
    eager: true,
  });

  await registerFixtures(fixtures, import.meta.url);
});
