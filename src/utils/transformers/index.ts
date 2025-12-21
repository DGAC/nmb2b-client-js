import { types } from './types.ts';
export { prepareSerializer } from './serializer.ts';

type T = typeof types;

type WithOutput = {
  [K in keyof T]: T[K]['output'] extends null ? never : K;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const deserializer: { [K in WithOutput]: T[K]['output'] } & Record<
  string,
  any
> = Object.entries(types).reduce<any>((prev, [key, { output }]) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (output) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    prev[key] = output;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return prev;
}, {});
