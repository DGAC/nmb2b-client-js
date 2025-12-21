import d from '../debug.ts';
import { createHook } from './hooks.ts';

export const logHook = createHook(({ service, query, input }) => {
  const debug = d(`${service}:${query}`);

  debug(`Called with input %o`, input);

  return {
    onRequestError: ({ error }) => debug(`Failed: ${error.message}`),
    onRequestSuccess: () => debug('Succeded'),
  };
});
