import { assert } from '../src/utils/assert.js';
import { fromEnv } from '../src/security.js';

assert(process.env.B2B_XSD_PATH, 'B2B_XSD_PATH is not defined');
assert(process.env.B2B_FLAVOUR, 'B2B_FLAVOUR is not defined');

const flavour = process.env.B2B_FLAVOUR;
if (flavour !== 'OPS' && flavour !== 'PREOPS') {
  throw new Error(
    'Invalid B2B_FLAVOUR env variable. Must be either OPS or PREOPS.',
  );
}

const ex = {
  XSD_PATH: process.env.B2B_XSD_PATH,
  security: fromEnv(),
  flavour,
  ...(!!process.env.B2B_ENDPOINT && { endpoint: process.env.B2B_ENDPOINT }),
  ...(!!process.env.B2B_XSD_REMOTE_URL && {
    xsdEndpoint: process.env.B2B_XSD_REMOTE_URL,
  }),
} as const;

export const TEST_B2B_OPTIONS = ex;
