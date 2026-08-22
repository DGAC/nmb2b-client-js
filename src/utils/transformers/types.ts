import { UTCDate } from '@date-fns/utc';
import { format, isDate } from 'date-fns';
import * as timeFormats from '../timeFormats.ts';
import { assert } from '../assert.ts';

const outputBase = {
  integer: (text: string) => {
    assert(typeof text === 'string', () => `Expected string, got ${JSON.stringify(text)}`);

    return parseInt(text, 10);
  },
  /**
   *
   * Parse a NMB2B date/datetime.
   *
   * All datetimes are assumed to be UTC.
   *
   * Per NM B2B documentation, we only need to support these formats:
   * - DateTimeMinute: YYYY-MM-DD hh:mm
   * - DateTimeSecond: YYYY-MM-DD hh:mm:ss
   * - DateYearMonthDay: YYYY-MM-DD
   *
   * All dates are
   * @param text NM B2B Date string
   * @returns Parsed Date instance
   */
  date: (text: string) => {
    assert(typeof text === 'string', () => `Expected string, got ${JSON.stringify(text)}`);

    // oxlint-disable-next-line prefer-const
    let [date, time, ms] = text.split(' ');

    if (date === undefined || time === undefined) {
      return new Date(text);
    }

    if (time.length === 5) {
      time += ':00';
    }

    return new Date(`${date}T${time}.${ms ?? '000'}Z`);
  },
};

interface SerDe {
  [key: string]: {
    input: null | ((input: unknown) => unknown);
    output: null | ((input: unknown) => unknown);
  };
}

export const types = {
  FlightLevel_DataType: {
    input: null,
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'FlightLevel_DataType',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.integer(s);
    },
  },
  DurationHourMinute: {
    input: (d: unknown): string => {
      assertInput(typeof d === 'number', {
        mode: 'serialize',
        xmlType: 'DurationHourMinute',
        message: () => `Expected number, got ${JSON.stringify(d)}`,
      });

      const totalMinutes = Math.floor(d / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return hours.toFixed(0).padStart(2, '0') + minutes.toFixed(0).padStart(2, '0');
    },
    output: (s: unknown): number => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'DurationHourMinute',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      const hours = parseInt(s.slice(0, 2), 10);
      const minutes = parseInt(s.slice(2), 10);

      return 60 * (60 * hours + minutes);
    },
  },
  DurationHourMinuteSecond: {
    input: (d: unknown): string => {
      assertInput(typeof d === 'number', {
        mode: 'serialize',
        xmlType: 'DurationHourMinuteSecond',
        message: () => `Expected number, got ${JSON.stringify(d)}`,
      });

      const totalMinutes = Math.floor(d / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const seconds = d % 60;

      return (
        hours.toFixed(0).padStart(2, '0') +
        minutes.toFixed(0).padStart(2, '0') +
        seconds.toFixed(0).padStart(2, '0')
      );
    },
    output: (s: unknown): number => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'DurationHourMinuteSecond',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      const hours = parseInt(s.slice(0, 2), 10);
      const minutes = parseInt(s.slice(2, 4), 10);
      const seconds = parseInt(s.slice(4), 10);

      return 3600 * hours + 60 * minutes + seconds;
    },
  },
  DurationMinute: {
    input: (d: unknown): number => {
      assertInput(typeof d === 'number', {
        mode: 'serialize',
        xmlType: 'DurationMinute',
        message: () => `Expected number, got ${JSON.stringify(d)}`,
      });

      return Math.floor(d / 60);
    },
    output: (d: unknown): number => {
      assertInput(typeof d === 'number', {
        mode: 'deserialize',
        xmlType: 'DurationMinute',
        message: () => `Expected number, got ${JSON.stringify(d)}`,
      });

      return 60 * d;
    },
  },
  CountsValue: {
    input: null,
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'CountsValue',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.integer(s);
    },
  },
  DateTimeMinute: {
    input: (d: unknown): string => {
      assertInput(isDate(d), {
        mode: 'serialize',
        xmlType: 'DateTimeMinute',
        message: () => `Expected Date instance, got ${JSON.stringify(d)}`,
      });

      return format(new UTCDate(d), timeFormats.timeFormat);
    },
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'DateTimeMinute',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.date(s);
    },
  },
  DateYearMonthDay: {
    input: (d: unknown): string => {
      assertInput(isDate(d), {
        mode: 'serialize',
        xmlType: 'DateYearMonthDay',
        message: () => `Expected Date instance, got ${JSON.stringify(d)}`,
      });
      return format(new UTCDate(d), timeFormats.dateFormat);
    },
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'DateYearMonthDay',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.date(s);
    },
  },
  DateTimeSecond: {
    input: (d: unknown): string => {
      assertInput(isDate(d), {
        mode: 'serialize',
        xmlType: 'DateTimeSecond',
        message: () => `Expected Date instance, got ${JSON.stringify(d)}`,
      });

      return format(new UTCDate(d), timeFormats.timeFormatWithSeconds);
    },
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'DateTimeSecond',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.date(s);
    },
  },
  Timestamp: {
    input: (d: unknown): string => {
      assertInput(isDate(d), {
        mode: 'serialize',
        xmlType: 'Timestamp',
        message: () => `Expected Date instance, got ${JSON.stringify(d)}`,
      });

      return format(new UTCDate(d), timeFormats.timeFormatWithSecondsAndMilliseconds);
    },
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'Timestamp',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.date(s);
    },
  },
  DistanceNM: {
    input: null,
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'DistanceNM',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.integer(s);
    },
  },
  DistanceM: {
    input: null,
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'DistanceM',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.integer(s);
    },
  },
  Bearing: {
    input: null,
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'Bearing',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.integer(s);
    },
  },
  OTMVThreshold: {
    input: null,
    output: (s: unknown) => {
      assertInput(typeof s === 'string', {
        mode: 'deserialize',
        xmlType: 'OTMVThreshold',
        message: () => `Expected string, got ${JSON.stringify(s)}`,
      });

      return outputBase.integer(s);
    },
  },
} satisfies SerDe;

export function assertInput(
  condition: unknown,
  {
    mode,
    xmlType,
    message,
  }: { mode: 'serialize' | 'deserialize'; xmlType: string; message: () => string },
): asserts condition {
  const messageBuilder = () =>
    `[${xmlType}] ${mode === 'serialize' ? 'Serialization' : 'Deserialization'} failed.\n${message()}`;

  assert(condition, messageBuilder);
}
