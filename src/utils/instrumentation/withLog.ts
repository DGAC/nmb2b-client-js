import type { Instrumentor } from './';
import d from '../debug';

export function withLog<Input, Output>(
  namespace: string,
): Instrumentor<Input, Output> {
  const debug = d(namespace);

  return (fn) => (values, options) => {
    if (values) {
      debug('Called with input %o', values);
    } else {
      debug('Called');
    }

    return fn(values, options).then(
      (res) => {
        debug('Succeded');
        return res;
      },
      (err) => {
        debug('Failed');
        return Promise.reject(err);
      },
    );
  };
}
