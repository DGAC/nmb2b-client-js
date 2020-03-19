/**
 * @jest-environment node
 */

import { getEndpoint, getFileUrl, getFileEndpoint } from './config';

describe('getEndpoint', () => {
  test('without flavour', () => {
    expect(getEndpoint()).toMatchInlineSnapshot(
      `"https://www.b2b.nm.eurocontrol.int/B2B_OPS/gateway/spec/23.5.0"`,
    );
  });

  test('with flavour', () => {
    expect(getEndpoint({ flavour: 'OPS' })).toMatchInlineSnapshot(
      `"https://www.b2b.nm.eurocontrol.int/B2B_OPS/gateway/spec/23.5.0"`,
    );
  });
});

describe('getFileEndpoint', () => {
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

describe('getFileUrl', () => {
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
