import d from 'debug';
const PREFIX = '@dgac/nmb2b-client';
const debug = d(PREFIX);

function log(ns?: string) {
  if (!ns) {
    return debug;
  }

  return debug.extend(ns);
}

export default log;
