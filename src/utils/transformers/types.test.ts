import { fromAny } from '@total-typescript/shoehorn';
import { types } from './types.js';
import { test, expect, describe } from 'vitest';

describe('serialization', () => {
  const serialization = [
    { type: 'DurationMinute', input: 34 * 60, expected: 34 },
    { type: 'DurationHourMinute', input: 34 * 60, expected: '0034' },
    { type: 'DurationHourMinute', input: 34 * 60 + 30, expected: '0034' },
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
  ] satisfies Array<{ type: keyof typeof types; expected: any; input: any }>;

  test.each(serialization)(
    '$type .input($input) => $expected',
    ({ type, expected, input }) => {
      expect(types[type].input(fromAny(input))).toEqual(expected);
    },
  );
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
  ] satisfies Array<{ type: keyof typeof types; input: any; expected: any }>;

  test.each(deserialization)(
    '$type .output($input) => $expected',
    ({ type, input, expected }) => {
      const deserializer = types[type].output;
      expect(deserializer(fromAny(input))).toEqual(expected);
    },
  );
});
