import { types } from './types';
export { prepareSerializer } from './serializer';

type T = typeof types;

type WithOutput = {
  [K in keyof T]: T[K]['output'] extends null ? never : K;
}[keyof T];

export const deserializer: { [K in WithOutput]: T[K]['output'] } =
  Object.entries(types).reduce((prev, [key, { output }]) => {
    if (output) {
      prev[key] = output;
    }

    return prev;
  }, {} as any);
