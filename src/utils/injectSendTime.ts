import moment from 'moment';
import { timeFormatWithSeconds } from './timeFormats';
import { Request } from '../Common/types';

export default function injectSendTime<T>(values: T): Request {
  const sendTime = moment.utc().toDate();

  if (!values || typeof values !== 'object') {
    return { sendTime };
  }

  return { sendTime, ...values};
}
