import { UTCDate } from '@date-fns/utc';
import { format } from 'date-fns';
import * as timeFormats from '../timeFormats.js';

const outputBase = {
  integer: (text: string) => {
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
    // eslint-disable-next-line prefer-const
    let [date, time] = text.split(' ');

    if (date === undefined || time === undefined) {
      return new Date(text);
    }

    if (time.length === 5) {
      time += ':00';
    }

    return new Date(`${date}T${time}Z`);
  },
};

interface SerDe {
  [key: string]: {
    input: null | ((input: never) => unknown);
    output: null | ((input: never) => unknown);
  };
}

export const types = {
  FlightLevel_DataType: {
    input: null,
    output: outputBase.integer,
  },
  DurationHourMinute: {
    input: (d: number): string => {
      const totalMinutes = Math.floor(d / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return (
        hours.toFixed(0).padStart(2, '0') + minutes.toFixed(0).padStart(2, '0')
      );
    },
    output: (s: string): number => {
      const hours = parseInt(s.slice(0, 2), 10);
      const minutes = parseInt(s.slice(2), 10);

      return 60 * (60 * hours + minutes);
    },
  },
  DurationHourMinuteSecond: {
    input: (d: number): string => {
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
    output: (s: string): number => {
      const hours = parseInt(s.slice(0, 2), 10);
      const minutes = parseInt(s.slice(2, 4), 10);
      const seconds = parseInt(s.slice(4), 10);

      return 3600 * hours + 60 * minutes + seconds;
    },
  },
  DurationMinute: {
    input: (d: number): number => Math.floor(d / 60),
    output: (d: number): number => 60 * d,
  },
  CountsValue: {
    input: null,
    output: outputBase.integer,
  },
  DateTimeMinute: {
    input: (d: Date): string => format(new UTCDate(d), timeFormats.timeFormat),
    output: outputBase.date,
  },
  DateYearMonthDay: {
    input: (d: Date): string => format(new UTCDate(d), timeFormats.dateFormat),
    output: outputBase.date,
  },
  DateTimeSecond: {
    input: (d: Date): string =>
      format(new UTCDate(d), timeFormats.timeFormatWithSeconds),
    output: outputBase.date,
  },
  DistanceNM: {
    input: null,
    output: outputBase.integer,
  },
  DistanceM: {
    input: null,
    output: outputBase.integer,
  },
  Bearing: {
    input: null,
    output: outputBase.integer,
  },
  OTMVThreshold: {
    input: null,
    output: outputBase.integer,
  },
} satisfies SerDe;
