import { describe, expect, test } from 'vitest';
import { createTestSecurities, findCredentialPaths } from './credentials.ts';

const { 'API Gateway': apiGw, PFX: pfx, PEM: pem } = createTestSecurities();

describe(findCredentialPaths, () => {
  test('finds nothing in a value free of credentials', () => {
    expect(findCredentialPaths({ message: 'boom', nested: [1, 'two'] }, apiGw)).toEqual([]);
  });

  test('finds a secret through non-enumerable, symbol-keyed and cyclic properties', () => {
    const inner: Record<string | symbol, unknown> = {};
    inner.self = inner;
    inner[Symbol('headers')] = {
      Authorization: `Basic ${btoa(`${apiGw.apiKeyId}:${apiGw.apiSecretKey}`)}`,
    };

    const error = new Error('boom');
    Object.defineProperty(error, 'config', { value: inner, enumerable: false });

    expect(findCredentialPaths(error, apiGw)).toEqual([
      '<root>.config.Symbol(headers).Authorization',
    ]);
  });

  test('finds a secret behind a getter on the prototype chain', () => {
    class Holder {
      #secret = apiGw.apiSecretKey;
      get password() {
        return this.#secret;
      }
    }

    expect(findCredentialPaths(new Holder(), apiGw)).toEqual(['<root>.password']);
  });

  test('finds certificate bytes and passphrases in buffers, strings and Map entries', () => {
    const agentOptions = new Map([
      ['options', { pfx: Buffer.from(pfx.pfx), passphrase: pfx.passphrase }],
    ]);

    expect(findCredentialPaths(agentOptions, pfx)).toEqual([
      '<root>.<map value>.pfx',
      '<root>.<map value>.passphrase',
    ]);
  });

  test('finds a certificate used as a property key', () => {
    const sockets = { [`fake-b2b.test:443:${pem.cert.toString('utf8')}`]: [] };

    expect(findCredentialPaths({ sockets }, pem)).toEqual(['<root>.sockets.<credential>']);
  });

  test('finds an extra secret inside a longer string', () => {
    const message = 'Request failed: GET https://user:url-secret@fake-b2b.test/archive.tar.gz';

    expect(findCredentialPaths({ message }, apiGw, ['url-secret'])).toEqual(['<root>.message']);
  });

  test('finds a PEM key serialised as text', () => {
    expect(findCredentialPaths({ body: `key=${pem.key.toString('utf8')}` }, pem)).toEqual([
      '<root>.body',
    ]);
  });
});
