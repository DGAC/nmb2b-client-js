import type { SetOptional } from 'type-fest';
import type { B2BRequest, Reply, ReplyStatus } from '../Common/types.js';
import { NMB2BError } from './NMB2BError.js';

export type InjectSendTime<T extends B2BRequest> = SetOptional<T, 'sendTime'>;

export function injectSendTime<T extends InjectSendTime<B2BRequest>>(
  values: T,
): T & { sendTime: Date } {
  const sendTime = new Date();

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
