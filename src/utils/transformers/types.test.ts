import { fromAny } from '@total-typescript/shoehorn';
import { types } from './types.ts';
import { test, expect, describe } from 'vitest';

type SerDe = typeof types;

type SerDeTestCase<TInput, TOutput = string> = {
  type: keyof SerDe;
  serialize?: [input: TInput, expected: TOutput];
  deserialize?: [input: TOutput, expected: TInput];
};

describe('date time derivatives', () => {
  const TEST_CASES = [
    {
      type: 'DateTimeMinute',
      serialize: [new Date('2018-07-01T17:55:13-07:00'), '2018-07-02 00:55'],
      deserialize: ['2018-07-02 00:55', new Date('2018-07-02T00:55:00Z')],
    },
    {
      type: 'DateTimeSecond',
      serialize: [new Date('2018-07-01T17:55:13-07:00'), '2018-07-02 00:55:13'],
      deserialize: ['2018-07-02 00:55:13', new Date('2018-07-02T00:55:13Z')],
    },
    {
      type: 'DateYearMonthDay',
      serialize: [new Date('2018-07-01T17:55:13-07:00'), '2018-07-02'],
      deserialize: ['2018-07-02', new Date('2018-07-02T00:00:00Z')],
    },
    {
      type: 'Timestamp',
      serialize: [new Date('2018-07-01T17:55:13.125-07:00'), '2018-07-02 00:55:13 125'],
      deserialize: ['2018-07-02 00:55:13 125', new Date('2018-07-02T00:55:13.125Z')],
    },
  ] satisfies Array<SerDeTestCase<Date>>;

  describe.each(TEST_CASES)('$type', ({ type, serialize, deserialize }) => {
    describe('serialization', () => {
      test(`should serialize correctly Date(${serialize[0].toISOString()}) to "${serialize[1]}"`, () => {
        expect(types[type].input(serialize[0])).toEqual(serialize[1]);
      });

      test.each([12345, 'foo', {}, null])('should throw for a non Date input (%j)', (input) => {
        expect(() => types[type].input(input)).toThrow(/serialization failed/i);
      });
    });

    describe('deserialization', () => {
      test(`should deserialize correctly "${deserialize[0]}" to Date(${deserialize[1].toISOString()})`, () => {
        expect(types[type].output(deserialize[0])).toEqual(deserialize[1]);
      });

      test.each([12345, {}, null])('should throw for a non string input (%j)', (input) => {
        expect(() => types[type].output(input)).toThrow(/deserialization failed/i);
      });
    });
  });
});

describe('durations', () => {
  const TEST_CASES = [
    {
      type: 'DurationMinute',
      serialize: [34 * 60, 34],
      deserialize: [34, 34 * 60],
    },
    {
      type: 'DurationHourMinute',
      serialize: [34 * 60, '0034'],
      deserialize: ['0034', 34 * 60],
    },
    {
      type: 'DurationHourMinute',
      serialize: [34 * 60 + 30, '0034'],
      deserialize: ['0034', 34 * 60],
    },
    {
      type: 'DurationHourMinuteSecond',
      serialize: [2 * 3600 + 30 * 60 + 45, '023045'],
      deserialize: ['023045', 2 * 3600 + 30 * 60 + 45],
    },
  ] satisfies Array<SerDeTestCase<number, number | string>>;

  describe.each(TEST_CASES)('$type', ({ type, serialize, deserialize }) => {
    describe('serialization', () => {
      test(`should serialize correctly ${JSON.stringify(serialize[0])} seconds to "${serialize[1]}"`, () => {
        expect(types[type].input(serialize[0])).toEqual(serialize[1]);
      });

      test.each(['foo', null, {}])('should throw for a non integer input (%j)', (input) => {
        expect(() => types[type].input(input)).toThrow(/serialization failed/i);
      });
    });

    describe('deserialization', () => {
      test(`should deserialize correctly "${deserialize[0]}" to ${JSON.stringify(deserialize[1])} seconds`, () => {
        expect(types[type].output(deserialize[0])).toEqual(deserialize[1]);
      });

      test.each([null, {}])('should throw for a non string input (%j)', (input) => {
        expect(() => types[type].output(input)).toThrow(/deserialization failed/i);
      });
    });
  });
});

describe('integer values', () => {
  const TEST_CASES = [
    'FlightLevel_DataType',
    'CountsValue',
    'DistanceNM',
    'DistanceM',
    'Bearing',
    'OTMVThreshold',
  ] satisfies Array<keyof SerDe>;

  describe.each(TEST_CASES)('%s', (type) => {
    test(`should not have a serialize method`, () => {
      expect(types[type].input).toBeNull();
    });

    test(`should deserialize correctly`, () => {
      expect(types[type].output(`0356`)).toEqual(356);
    });

    test.each([123, null, {}])('should throw for a non string input (%j)', (input) => {
      expect(() => types[type].output(input)).toThrow(/deserialization failed/i);
    });
  });
});

describe('serialization', () => {
  const serialization = [
    { type: 'DurationMinute', input: 34 * 60, expected: 34 },
    { type: 'DurationHourMinute', input: 34 * 60, expected: '0034' },
    { type: 'DurationHourMinute', input: 34 * 60 + 30, expected: '0034' },
    { type: 'DurationHourMinute', input: 2 * 60 * 60 + 10 * 60, expected: '0210' },
    {
      type: 'DurationHourMinuteSecond',
      input: 2 * 3600 + 30 * 60 + 45,
      expected: '023045',
    },
    {
      type: 'DateTimeSecond',
      input: new Date('2018-07-01T17:55:13-07:00'),
      expected: '2018-07-02 00:55:13',
    },
    {
      type: 'Timestamp',
      input: new Date('2018-07-01T17:55:13.125-07:00'),
      expected: '2018-07-02 00:55:13 125',
    },
  ] satisfies Array<{
    type: keyof typeof types;
    expected: unknown;
    input: unknown;
  }>;

  test.each(serialization)('$type .input($input) => $expected', ({ type, expected, input }) => {
    expect(types[type].input(fromAny(input))).toEqual(expected);
  });
});

describe('deserialization', () => {
  const deserialization = [
    { type: 'DurationMinute', input: 34, expected: 34 * 60 },
    { type: 'DurationHourMinute', input: '0034', expected: 34 * 60 },
    {
      type: 'DurationHourMinute',
      input: '0210',
      expected: 2 * 60 * 60 + 10 * 60,
    },
    {
      type: 'DurationHourMinuteSecond',
      input: '023045',
      expected: 2 * 3600 + 30 * 60 + 45,
    },
    { type: 'CountsValue', input: '34', expected: 34 },
    {
      type: 'DateTimeSecond',
      input: '2018-07-02 00:55:13',
      expected: new Date('2018-07-02T00:55:13Z'),
    },
    {
      type: 'DateTimeSecond',
      input: '2018-07-02 00:55',
      expected: new Date('2018-07-02T00:55:00Z'),
    },
    {
      type: 'DateTimeSecond',
      input: '2018-07-02',
      expected: new Date('2018-07-02T00:00:00Z'),
    },
    {
      type: 'Timestamp',
      input: '2026-07-20 23:15:10 125',
      expected: new Date('2026-07-20T23:15:10.125Z'),
    },
  ] satisfies Array<{
    type: keyof typeof types;
    input: unknown;
    expected: unknown;
  }>;

  test.each(deserialization)('$type .output($input) => $expected', ({ type, input, expected }) => {
    const deserializer = types[type].output;
    expect(deserializer(fromAny(input))).toEqual(expected);
  });
});
