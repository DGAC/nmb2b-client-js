import { fromPartial } from '@total-typescript/shoehorn';
import {
  getEndpoint,
  getFileUrl,
  getFileEndpoint,
  obfuscate,
} from './config.js';

import { test, expect, describe } from 'vitest';

describe(getEndpoint, () => {
  test('without flavour', () => {
    expect(getEndpoint()).toMatchInlineSnapshot(
      `"https://www.b2b.nm.eurocontrol.int/B2B_OPS/gateway/spec/27.0.0"`,
    );
  });

  test('with flavour', () => {
    expect(getEndpoint({ flavour: 'OPS' })).toMatchInlineSnapshot(
      `"https://www.b2b.nm.eurocontrol.int/B2B_OPS/gateway/spec/27.0.0"`,
    );
  });
});

describe(getFileEndpoint, () => {
  test('without flavour', () => {
    expect(getFileEndpoint()).toMatchInlineSnapshot(
      `"https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec"`,
    );
  });

  test('with flavour', () => {
    expect(getFileEndpoint({ flavour: 'OPS' })).toMatchInlineSnapshot(
      `"https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec"`,
    );
  });
});

describe(getFileUrl, () => {
  test('without flavour', () => {
    expect(getFileUrl('bla')).toMatchInlineSnapshot(
      `"https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec/bla"`,
    );
  });

  test('with flavour', () => {
    expect(getFileUrl('bla', { flavour: 'OPS' })).toMatchInlineSnapshot(
      `"https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec/bla"`,
    );
  });

  test('with leading slash', () => {
    expect(getFileUrl('/bla')).toMatchInlineSnapshot(
      `"https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec/bla"`,
    );
  });

  test('with overriden endpoint', () => {
    expect(
      getFileUrl('/bla', { endpoint: 'https://blabla' }),
    ).toMatchInlineSnapshot(`"https://blabla/bla"`);
  });
});

describe(obfuscate, () => {
  test('should obfuscate all security values', () => {
    const obfuscated = obfuscate(
      fromPartial({
        xsdEndpoint: 'foobar',
        security: { apiKeyId: 'bar', apiSecretKey: 'baz' },
      }),
    );

    expect(obfuscated).toEqual({
      xsdEndpoint: 'foobar',
      security: {
        apiKeyId: 'xxxxxxxxxxxxxxxx',
        apiSecretKey: 'xxxxxxxxxxxxxxxx',
      },
    });
  });
});
