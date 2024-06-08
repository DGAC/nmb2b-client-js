import type { Reply, ReplyStatus, Request } from '../Common/types';
import { NMB2BError } from './NMB2BError';

export function injectSendTime<
  T extends Record<string, any> | null | undefined,
>(values: T): Request {
  const sendTime = new Date();

  if (!values || typeof values !== 'object') {
    return { sendTime };
  }

  return { sendTime, ...values };
}

type Cb = (...args: any[]) => void;

export function responseStatusHandler(resolve: Cb, reject: Cb) {
  return (err: unknown, reply: Reply) => {
    if (err) {
      reject(err);
      return;
    }

    if (reply.status === 'OK') {
      resolve(reply);
      return;
    } else {
      const err = new NMB2BError({
        reply: reply as Reply & { status: Exclude<ReplyStatus, 'OK'> },
      });
      reject(err);
      return;
    }
  };
}
