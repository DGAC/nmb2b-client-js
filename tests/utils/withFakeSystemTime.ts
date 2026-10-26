import { vi } from 'vitest';

/**
 * Freezes `Date` at `now` until disposed. Timers and network are untouched.
 *
 * Implemented with `vi`, so it must run inside a Vitest test.
 */
export function withFakeSystemTime(now: Date): Disposable {
  vi.setSystemTime(now);
  return {
    [Symbol.dispose]: () => {
      vi.useRealTimers();
    },
  };
}
