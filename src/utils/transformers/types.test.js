/**
 * @jest-environment node
 * @flow
 */

import moment from 'moment';
import { types } from './types';

const serialization = [
  ['DurationMinute', 34 * 60, 34],
  ['DurationHourMinute', 34 * 60, '0034'],
  ['DurationHourMinute', 34 * 60 + 30, '0034'],
  ['DurationHourMinuteSecond', 2 * 3600 + 30 * 60 + 45, '023045'],
  [
    'DateTimeSecond',
    new Date('2018-07-01T17:55:13-07:00'),
    '2018-07-02 00:55:13',
  ],
];

test.each(serialization)('%s.input(%p) => %p', (t, input, expected) => {
  expect(types[t].input(input)).toEqual(expected);
});

const deserialization = [
  ['DurationMinute', 34, 34 * 60],
  ['DurationHourMinute', '0034', 34 * 60],
  ['DurationHourMinute', '0210', 2 * 60 * 60 + 10 * 60],
  ['DurationHourMinuteSecond', '023045', 2 * 3600 + 30 * 60 + 45],
  ['CountsValue', '34', 34],
  [
    'DateTimeSecond',
    '2018-07-02 00:55:13',
    new Date('2018-07-01T17:55:13-07:00'),
  ],
];

test.each(deserialization)('%s.output(%p) => %p', (t, input, expected) => {
  expect(types[t].output(input)).toEqual(expected);
});
