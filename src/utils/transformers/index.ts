/* @flow */
import { types } from './types';
export { prepareSerializer } from './serializer';

type T = typeof types;
type Diff<T, U> = T extends U ? never : T;

type WithOutput = {
  [K in keyof T]: T[K]['output'] extends null ? never : K
}[keyof T];

export const deserializer: { [K in WithOutput]: T[K]['output'] } = Object.keys(
  types,
).reduce(
  (prev, curr: WithOutput) => {
    const { output } = types[curr];

    if (output) {
      prev[curr] = output;
    }

    return prev;
  },
  {} as any,
);
