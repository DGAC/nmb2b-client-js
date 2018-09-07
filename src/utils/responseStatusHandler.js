/* @flow */

type Cb = any => void;

import type { Reply } from '../Common/types';

export default function responseStatusHandler(resolve: Cb, reject: Cb) {
  return (err: ?Object, res: Reply, raw: string) => {
    if (err) {
      return reject(err);
    }

    const { status } = res;

    if (status !== 'OK') {
      return reject(res);
    }

    return resolve(res);
  };
}
