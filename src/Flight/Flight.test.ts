import {
  collectFixtures,
  registerAutoTests,
} from '../../tests/utils/runner.js';
import { describe } from 'vitest';

describe('Flight Fixtures', async () => {
  const fixtures = collectFixtures(import.meta.url);
  await registerAutoTests(fixtures);
});
