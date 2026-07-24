import { UTCDate } from '@date-fns/utc';
import { describe, expect, test } from 'vitest';
import {
  assertIsValidSchema,
  prepareSerializer,
  createKeyOrderTransformer,
} from './serializer.ts';
import { AssertionError } from 'node:assert';

describe(createKeyOrderTransformer, () => {
  type TestCase = [
    label: string,
    inputOutput: {
      input: Record<string, unknown>;
      expectedOutput: Record<string, unknown>;
    },
  ];

  describe('with a flat schema', () => {
    const schema = { a: 'string', b: 'string', c: 'string' };
    const transformInput = createKeyOrderTransformer(schema);

    const cases: TestCase[] = [
      [
        'should preserve order when already sorted',
        {
          input: { a: 'foo', b: 'bar' },
          expectedOutput: { a: 'foo', b: 'bar' },
        },
      ],
      [
        'should reorder keys when input is unsorted',
        {
          input: { b: 'bar', c: 'baz', a: 'foo' },
          expectedOutput: { a: 'foo', b: 'bar', c: 'baz' },
        },
      ],
      [
        'should handle missing optional keys',
        {
          input: { a: 'foo' },
          expectedOutput: { a: 'foo' },
        },
      ],
      [
        'should remove extraneous keys',
        {
          input: { unknown: 'foo' },
          expectedOutput: {},
        },
      ],
      [
        'should handle null value',
        { input: { a: null }, expectedOutput: { a: null } },
      ],
      [
        'should handle undefined value',
        { input: { a: undefined }, expectedOutput: { a: undefined } },
      ],
    ];

    test.each(cases)('%s', (_, { input, expectedOutput }) => {
      expect(recursiveObjectEntries(transformInput(input))).toEqual(
        recursiveObjectEntries(expectedOutput),
      );
    });
  });

  describe('with a schema containing a nested subschema', () => {
    const schema = {
      a: 'string',
      b: 'string',
      c: { first: 'string', second: 'string' },
    };
    const transformInput = createKeyOrderTransformer(schema);

    const cases: TestCase[] = [
      [
        'should recursively reorder nested object keys',
        {
          input: { c: { second: 'foo', first: 'bar' }, b: 'bar', a: 'foo' },
          expectedOutput: {
            a: 'foo',
            b: 'bar',
            c: { first: 'bar', second: 'foo' },
          },
        },
      ],
      [
        'should ignore undefined nested key',
        {
          input: { b: 'bar', a: 'foo' },
          expectedOutput: {
            a: 'foo',
            b: 'bar',
          },
        },
      ],
      [
        'should remove extraneous keys',
        {
          input: { c: { unknown: 'foo' } },
          expectedOutput: { c: {} },
        },
      ],
      [
        'should handle null value',
        { input: { c: null }, expectedOutput: { c: null } },
      ],
      [
        'should handle undefined value',
        { input: { c: undefined }, expectedOutput: { c: undefined } },
      ],
      [
        'should replace primitive values with an empty object',
        { input: { c: 'foo' }, expectedOutput: { c: {} } },
      ],
    ];

    test.each(cases)('%s', (_, { input, expectedOutput }) => {
      expect(recursiveObjectEntries(transformInput(input))).toEqual(
        recursiveObjectEntries(expectedOutput),
      );
    });
  });

  describe('with a schema containing lists and namespaces', () => {
    const schema = {
      'a[]': 'SomeB2BList',
      b: {
        targetNSAlias: 'flight',
        targetNamespace: 'eurocontrol/cfmu/b2b/FlightServices',
      },
      c: { first: 'string', second: 'string' },
    };
    const transformInput = createKeyOrderTransformer(schema);

    const cases: TestCase[] = [
      [
        'should preserve list values and handle namespaces correctly',
        {
          input: {
            c: { second: 'foo', first: 'bar' },
            b: 'bar',
            a: [1, 2, 3],
          },
          expectedOutput: {
            a: [1, 2, 3],
            b: 'bar',
            c: { first: 'bar', second: 'foo' },
          },
        },
      ],
    ];

    test.each(cases)('%s', (_, { input, expectedOutput }) => {
      expect(recursiveObjectEntries(transformInput(input))).toEqual(
        recursiveObjectEntries(expectedOutput),
      );
    });
  });

  describe('with a schema containing a list of objects', () => {
    const schema = {
      'a[]': {
        foo: 'string',
        bar: 'string',
      },
    };
    const transformInput = createKeyOrderTransformer(schema);

    const cases: TestCase[] = [
      [
        'should recursively reorder items within arrays of objects',
        {
          input: {
            a: [
              {
                bar: 'bar',
                foo: 'foo',
              },
            ],
          },
          expectedOutput: { a: [{ foo: 'foo', bar: 'bar' }] },
        },
      ],
      [
        'should remove extraneous keys',
        {
          input: { a: [{ foo: 'bar', unknown: 'foo' }] },
          expectedOutput: { a: [{ foo: 'bar' }] },
        },
      ],
      [
        'should handle null value',
        {
          input: { a: null },
          expectedOutput: { a: null },
        },
      ],
      [
        'should handle undefined value',
        {
          input: { a: undefined },
          expectedOutput: { a: undefined },
        },
      ],
    ];

    test.each(cases)('%s', (_, { input, expectedOutput }) => {
      expect(recursiveObjectEntries(transformInput(input))).toEqual(
        recursiveObjectEntries(expectedOutput),
      );
    });
  });

  function recursiveObjectEntries(
    input: Record<string, unknown> | null | undefined,
  ): null | undefined | Array<[string, unknown]> {
    if (!input) {
      return input;
    }

    return Object.entries(input).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return [key, recursiveObjectEntries(value as Record<string, unknown>)];
      }

      return [key, value];
    });
  }
});

describe(prepareSerializer, () => {
  describe('schema with array', () => {
    const schema = {
      foo: 'DateTimeMinute|xs:string|pattern',
      'item[]': {
        wef: 'DateTimeMinute|xs:string|pattern',
        unt: 'DateTimeMinute|xs:string|pattern',
      },
    };

    test('should prepare a correct serializer', () => {
      const input = {
        foo: new Date(),
        bar: 'bar',
        item: [
          {
            wef: new Date(),
            unt: new Date(),
          },
        ],
      };
      const serialize = prepareSerializer<typeof input>(schema);
      const serialized = serialize(input);

      expect(serialized.bar).not.toBeDefined();
      expect(serialized).toEqual({
        foo: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/),
        item: [
          {
            wef: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/),
            unt: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/),
          },
        ],
      });
    });
  });

  describe('retrieveOTMVPlan', () => {
    const schema = {
      endUserId: 'xs:string|pattern',
      sendTime: 'DateTimeSecond|xs:string|pattern',
      dataset: {
        type: 'DatasetType|xs:string|FORECAST,OPERATIONAL,SIMULATION',
        simulationIdentifier: {
          simulationType:
            'SimulationType|xs:string|STANDALONE_SIMEX,NMOC_MANAGED_SIMULATION,USER_MANAGED_SIMULATION',
          simulationId: 'SimulationId|xs:string|pattern',
          targetNSAlias: 'common',
          targetNamespace: 'eurocontrol/cfmu/b2b/CommonServices',
        },
        simulationState: {
          targetNSAlias: 'common',
          targetNamespace: 'eurocontrol/cfmu/b2b/CommonServices',
        },
        targetNSAlias: 'common',
        targetNamespace: 'eurocontrol/cfmu/b2b/CommonServices',
      },
      day: 'DateYearMonthDay|xs:string|pattern',
      otmvsWithDuration: {
        'item[]': {
          trafficVolume: 'TrafficVolumeId|xs:string|pattern',
          otmvDuration: 'DurationHourMinute|xs:string|pattern',
          targetNSAlias: 'flow',
          targetNamespace: 'eurocontrol/cfmu/b2b/FlowServices',
        },
      },
      targetNSAlias: 'flow',
      targetNamespace: 'eurocontrol/cfmu/b2b/FlowServices',
    };

    test('should serialize otmvDuration properly', () => {
      const serialize = prepareSerializer(schema);
      const now = new Date('2024-02-07T23:30:00.000Z');

      const prepared = serialize({
        dataset: { type: 'OPERATIONAL' },
        day: now,
        otmvsWithDuration: {
          item: [{ trafficVolume: 'LFBBDX', otmvDuration: 60 * 5 }],
        },
      });

      expect(prepared).toEqual(
        expect.objectContaining({
          dataset: {
            type: 'OPERATIONAL',
          },
          day: new UTCDate(now).toISOString().slice(0, 10),
          otmvsWithDuration: {
            item: [
              {
                trafficVolume: 'LFBBDX',
                otmvDuration: '0005',
              },
            ],
          },
        }),
      );
    });
  });
});

describe(assertIsValidSchema, () => {
  type TestCase = [label: string, schema: unknown];

  const VALID_CASES = [
    ['simple schema', { a: 'string' }],
    ['schema with list', { 'a[]': 'string' }],
    ['empty schema', {}],
    [
      'nested schema',
      {
        a: {
          b: {
            c: 'string',
          },
        },
      },
    ],
  ] satisfies Array<TestCase>;

  describe.each(VALID_CASES)('valid case: %s', (_, schema) => {
    test('should not throw', () => {
      expect(() => {
        assertIsValidSchema(schema);
      }).not.toThrow();
    });
  });

  const INVALID_CASES = [
    ['null', null],
    ['undefined', undefined],
    ['string', 'foo'],
    ['array', []],
    ['nested array', { foo: [] }],
    ['number property', { foo: 1 }],
  ] satisfies Array<TestCase>;

  describe.each(INVALID_CASES)('invalid case: %s', (_, schema) => {
    test('should throw', () => {
      expect(() => {
        assertIsValidSchema(schema);
      }).toThrow(AssertionError);
    });
  });
});
