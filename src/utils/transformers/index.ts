import { types } from './types.ts';
export { prepareSerializer } from './serializer.ts';

export const deserializer = Object.fromEntries(
  Object.entries(types).map(([key, { output }]) => [key, output]),
);
