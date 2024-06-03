import { Request } from '../Common/types';

export default function injectSendTime<T>(values: T): Request {
  const sendTime = new Date();

  if (!values || typeof values !== 'object') {
    return { sendTime };
  }

  return { sendTime, ...values };
}
