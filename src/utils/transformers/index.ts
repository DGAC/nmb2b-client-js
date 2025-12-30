import { types } from './types.js';
export { prepareSerializer } from './serializer.js';

export const deserializer = Object.fromEntries(
  Object.entries(types).map(([key, { output }]) => [key, output]),
);
