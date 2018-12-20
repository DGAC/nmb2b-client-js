type Cb = (...args: any[]) => void;

import { Reply } from '../Common/types';

export default function responseStatusHandler(resolve: Cb, reject: Cb) {
  return (err: any | null, res: Reply, raw: string) => {
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
