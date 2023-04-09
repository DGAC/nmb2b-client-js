import { types } from './types';
import { test, expect } from 'vitest';

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
    expect(types[type].input(input as any)).toEqual(expected);
  },
);

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
    expected: new Date('2018-07-01T17:55:13-07:00'),
  },
] satisfies Array<{ type: keyof typeof types; input: any; expected: any }>;

test.each(deserialization)(
  '$type .output($input) => $expected',
  ({ type, input, expected }) => {
    const deserializer: any = types[type].output;
    expect(deserializer(input)).toEqual(expected);
  },
);
