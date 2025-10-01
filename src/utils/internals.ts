import type { B2BRequest, Reply, ReplyStatus } from '../Common/types.js';
import { NMB2BError } from './NMB2BError.js';

export type WithInjectedSendTime<T extends B2BRequest> = Omit<T, 'sendTime'> & {
  sendTime?: Date | undefined;
};

export function injectSendTime<T extends B2BRequest>(
  values: WithInjectedSendTime<T>,
): T {
  const sendTime = new Date();

  return { sendTime, ...values } as T;
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

export function assertOkReply<T extends Reply>(
  reply: T,
): asserts reply is T & { status: 'OK' } {
  if (reply.status !== 'OK') {
    throw new NMB2BError({
      reply: reply as T & { status: Exclude<ReplyStatus, 'OK'> },
    });
  }
}
