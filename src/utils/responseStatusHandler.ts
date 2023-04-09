type Cb = (...args: any[]) => void;

import { Reply, B2B_Error, ReplyStatus } from '../Common/types';
import { NMB2BError } from './NMB2BError';

export default function responseStatusHandler(resolve: Cb, reject: Cb) {
  return (err: any | null, reply: Reply, raw: string) => {
    if (err) {
      return reject(err);
    }

    if (reply.status === 'OK') {
      return resolve(reply);
    } else {
      const err = new NMB2BError({
        reply: reply as Reply & { status: Exclude<ReplyStatus, 'OK'> },
      });
      return reject(err);
    }
  };
}
