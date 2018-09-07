/* @flow */
import moment from 'moment';
import { types } from './types';
export { prepareSerializer } from './serializer';

export const deserializer = Object.keys(types).reduce((prev, curr) => {
  if (types[curr].output) {
    prev[curr] = types[curr].output;
  }
  return prev;
}, {});
