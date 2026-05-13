import type { B2BRequest, Reply, ReplyStatus } from '../Common/types.ts';
import { assert } from './assert.ts';
import { NMB2BError } from './NMB2BError.ts';

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
    // oxlint-disable-next-line typescript/no-unnecessary-condition -- Just in case the response is completely broken.
    typeof reply === 'object' && reply !== null && 'status' in reply,
    `Invalid NM B2B Response:\n` + JSON.stringify(reply),
  );

  if (reply.status !== 'OK') {
    throw new NMB2BError({
      reply: reply as T & { status: Exclude<ReplyStatus, 'OK'> },
    });
  }
}
