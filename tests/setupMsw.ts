import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './utils/msw.ts';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
