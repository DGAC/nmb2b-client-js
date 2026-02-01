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

  // oxlint-disable-next-line no-unsafe-type-assertion
  return { sendTime, ...values } as T;
}

export function assertOkReply<T extends Reply>(
  reply: T,
): asserts reply is T & { status: 'OK' } {
  assert(
    typeof reply === 'object' && reply !== null && 'status' in reply,
    `Invalid NM B2B Response:\n` + JSON.stringify(reply),
  );

  if (reply.status !== 'OK') {
    throw new NMB2BError({
      // oxlint-disable-next-line no-unsafe-type-assertion
      reply: reply as T & { status: Exclude<ReplyStatus, 'OK'> },
    });
  }
}
