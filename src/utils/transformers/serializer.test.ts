/**
 * @jest-environment node
 */
import { reorderKeys } from './serializer';

describe('reorderKeys', () => {
  const testCases = [
    [
      // Schema
      { a: 'string', b: 'string' },
      // Input
      { a: 'foo', b: 'bar' },
      // Expected output
      { a: 'foo', b: 'bar' },
    ],
    [
      // Schema
      { a: 'string', b: 'string' },
      // Input
      { b: 'bar', a: 'foo' },
      // Expected output
      { a: 'foo', b: 'bar' },
    ],
    [
      // Schema
      { a: 'boolean', b: 'boolean' },
      // Input
      { b: false },
      // Expected output
      { b: false },
    ],
    [
      // Schema
      { a: 'string', b: 'string', c: { first: 'string', second: 'string' } },
      // Input
      { c: { second: 'foo', first: 'bar' }, b: 'bar', a: 'foo' },
      // Expected output
      { a: 'foo', b: 'bar', c: { first: 'bar', second: 'foo' } },
    ],
    [
      // Schema
      {
        'a[]': 'SomeB2BList',
        b: {
          targetNSAlias: 'flight',
          targetNamespace: 'eurocontrol/cfmu/b2b/FlightServices',
        },
        c: { first: 'string', second: 'string' },
      },
      // Input
      { c: { second: 'foo', first: 'bar' }, b: 'bar', a: [1, 2, 3] },
      // Expected output
      { a: [1, 2, 3], b: 'bar', c: { first: 'bar', second: 'foo' } },
    ],
    [
      // Schema
      {
        'a[]': {
          foo: 'string',
          bar: 'string',
        },
      },
      // Input
      {
        a: [
          {
            bar: 'bar',
            foo: 'foo',
          },
        ],
      },
      // Expected output
      { a: [{ foo: 'foo', bar: 'bar' }] },
    ],
  ];

  test.each(testCases as any)(
    'reorderKeys(%p)(%p) => %p',
    (schema, input, expected) => {
      expect(JSON.stringify(reorderKeys(schema)(input), null, 2)).toEqual(
        JSON.stringify(expected, null, 2),
      );
    },
  );
});
