/* @flow */
import moment from 'moment';
import { timeFormatWithSeconds } from './timeFormats';
import type { Request } from '../Common/types';

export default function injectSendTime<T>(values: T): Request {
  const sendTime = moment.utc().toDate();

  if (!values || typeof values !== 'object') {
    return { sendTime };
  }

  return Object.assign({}, { sendTime }, values);
}
