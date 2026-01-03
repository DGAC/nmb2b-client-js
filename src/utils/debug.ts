import d from 'debug';
const PREFIX = '@dgac/nmb2b-client';
const debug = d(PREFIX);

export function createDebugLogger(ns?: string) {
  if (!ns) {
    return debug;
  }

  return debug.extend(ns);
}
