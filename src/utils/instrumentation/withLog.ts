import { Instrumentor } from './';
import d from '../debug';

export function withLog<Input, Output>(
  namespace: string,
): Instrumentor<Input, Output> {
  const debug = d(namespace);

  return fn => (values, options) => {
    debug('Called with input %o', values);
    return fn(values, options).then(
      res => {
        debug('Succeded');
        return res;
      },
      err => {
        debug('Failed');
        return Promise.reject(err);
      },
    );
  };
}
