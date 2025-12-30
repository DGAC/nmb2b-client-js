import type { B2BRequest, Reply, ReplyStatus } from '../Common/types.js';
import { assert } from './assert.js';
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

export function assertOkReply<T extends Reply>(
  reply: T,
): asserts reply is T & { status: 'OK' } {
  assert(
    typeof reply === 'object' &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Just in case the response is completely broken.
      reply !== null &&
      'status' in reply,
    `Invalid NM B2B Response:\n` + JSON.stringify(reply),
  );

  if (reply.status !== 'OK') {
    throw new NMB2BError({
      reply: reply as T & { status: Exclude<ReplyStatus, 'OK'> },
    });
  }
}
