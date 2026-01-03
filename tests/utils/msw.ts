import { setupServer } from 'msw/node';
import { getSoapEndpoint } from '../../src/config.js';
import { MOCK_B2B_ENDPOINT } from '../constants.js';
import assert from 'node:assert';

const B2B_FLAVOUR = process.env.B2B_FLAVOUR;
assert(
  B2B_FLAVOUR === undefined ||
    B2B_FLAVOUR === 'OPS' ||
    B2B_FLAVOUR === 'PREOPS',
);

export const server = setupServer();
export const SOAP_ENDPOINT = getSoapEndpoint({
  endpoint: MOCK_B2B_ENDPOINT,
  flavour: B2B_FLAVOUR,
});
