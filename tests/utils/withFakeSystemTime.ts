import FakeTimers from '@sinonjs/fake-timers';

/**
 * Freezes `Date` at `now` until disposed. Timers and network are untouched.
 *
 * Does not depend on Vitest: fixture recording uses it too, outside Vitest.
 */
export function withFakeSystemTime(now: Date): Disposable {
  const clock = FakeTimers.install({ now, toFake: ['Date'] });
  return {
    [Symbol.dispose]: () => {
      clock.uninstall();
    },
  };
}
