import { describe, expect, test } from 'vitest';
import { deserializeFixtureContext, serializeFixtureContext } from './fixtureContext.ts';

function roundTrip(value: unknown): unknown {
  return deserializeFixtureContext(serializeFixtureContext(value));
}

describe('fixture context serialization', () => {
  test.each<[string, unknown]>([
    ['a string', 'LFEKD'],
    ['a number', 660],
    ['a negative decimal', -1.5],
    ['true', true],
    ['false', false],
    ['null', null],
    ['an array', ['LFEKD', 'LFEUH']],
    ['a plain object', { dataset: { type: 'OPERATIONAL' } }],
    ['a Date', new Date('2026-10-26T14:35:00.000Z')],
    [
      'nested Dates',
      {
        queryPeriod: { wef: new Date('2026-10-26T13:34:00.000Z') },
        days: [new Date('2026-10-26T00:00:00.000Z')],
      },
    ],
    ['an object with a $date key among others', { $date: '2026-10-26', other: 1 }],
  ])('round-trips %s', (_name, value) => {
    expect(roundTrip(value)).toEqual(value);
  });

  test('restores Date instances', () => {
    const restored = roundTrip({
      keys: { estimatedOffBlockTime: new Date('2026-10-26T09:25:00Z') },
    });

    expect(restored).toEqual({
      keys: { estimatedOffBlockTime: new Date('2026-10-26T09:25:00.000Z') },
    });
    expect(
      (restored as { keys: { estimatedOffBlockTime: unknown } }).keys.estimatedOffBlockTime,
    ).toBeInstanceOf(Date);
  });

  test('encodes a Date as { "$date": <ISO> }', () => {
    expect(JSON.parse(serializeFixtureContext({ day: new Date('2026-10-26T14:35:00Z') }))).toEqual({
      day: { $date: '2026-10-26T14:35:00.000Z' },
    });
  });

  test('omits an object key whose value is undefined', () => {
    expect(roundTrip({ a: 1, b: undefined })).toStrictEqual({ a: 1 });
  });
});
