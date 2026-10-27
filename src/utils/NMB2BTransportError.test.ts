import { expect, test } from 'vitest';

import { NMB2BTransportError } from '../index.ts';

test.each([
  ['https://user:secret@fake-b2b.test/wsdl', 'https://fake-b2b.test/wsdl'],
  ['https://fake-b2b.test/wsdl', 'https://fake-b2b.test/wsdl'],
  ['https://user:secret@fake b2b.test/wsdl', 'INVALID_URL'],
  ['https://user:secret@fake-b2b.test:99999/wsdl', 'INVALID_URL'],
  ['user:secret@fake-b2b.test/wsdl', 'INVALID_URL'],
])('reports %s as %s', (url, expected) => {
  const error = new NMB2BTransportError({ message: 'boom', kind: 'network', url });

  expect(error.url).toBe(expected);
});
