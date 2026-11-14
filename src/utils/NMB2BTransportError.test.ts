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

test('is named NMB2BTransportError', () => {
  const error = new NMB2BTransportError({ message: 'boom', kind: 'network' });

  expect(error.name).toBe('NMB2BTransportError');
});

test('is an Error', () => {
  const error = new NMB2BTransportError({ message: 'boom', kind: 'network' });

  expect(error).toBeInstanceOf(Error);
});

test('starts its stack trace with its name and message', () => {
  const error = new NMB2BTransportError({ message: 'boom', kind: 'network' });

  expect(error.stack).toMatch(/^NMB2BTransportError: boom\n/);
});

test('keeps the body out of default serialisation', () => {
  const error = new NMB2BTransportError({
    message: 'boom',
    kind: 'http',
    body: '<p>Bad Gateway</p>',
  });

  expect(Object.keys(error)).not.toContain('body');
  expect(JSON.stringify(error)).not.toContain('Bad Gateway');
});
