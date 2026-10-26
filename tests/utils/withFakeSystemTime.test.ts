import { describe, expect, test } from 'vitest';
import { withFakeSystemTime } from './withFakeSystemTime.ts';

describe('withFakeSystemTime', () => {
  test('freezes Date until disposed', () => {
    const frozenAt = new Date('2000-01-01T00:00:00Z');
    const realNowBefore = Date.now();

    const clock = withFakeSystemTime(frozenAt);
    expect(new Date()).toEqual(frozenAt);

    clock[Symbol.dispose]();

    expect(Date.now()).toBeGreaterThanOrEqual(realNowBefore);
  });
});
