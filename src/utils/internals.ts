import type { Reply, ReplyStatus, Request } from '../Common/types.js';
import { NMB2BError } from './NMB2BError.js';

export function injectSendTime<T extends Record<string, unknown>>(
  values: T,
): T & Request;
export function injectSendTime<T extends Record<string, unknown>>(
  values: T | undefined,
): Request | (Request & T);
export function injectSendTime<T extends Record<string, unknown> | undefined>(
  values: T,
) {
  const sendTime = new Date();

  return Object.assign({}, values ?? {}, { sendTime });
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
