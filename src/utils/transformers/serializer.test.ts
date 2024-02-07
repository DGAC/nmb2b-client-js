import { reorderKeys, prepareSerializer } from './serializer';
import { describe, test, expect } from 'vitest';
import { UTCDate } from '@date-fns/utc';

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
  ] satisfies Array<[any, any, any]>;

  test.each(testCases)(
    'reorderKeys(%j)(%j) => %j',
    (schema, input, expected) => {
      expect(JSON.stringify(reorderKeys(schema)(input), null, 2)).toEqual(
        JSON.stringify(expected, null, 2),
      );
    },
  );
});

describe('schema with array', () => {
  const schema = {
    foo: 'DateTimeMinute|xs:string|pattern',
    'item[]': {
      wef: 'DateTimeMinute|xs:string|pattern',
      unt: 'DateTimeMinute|xs:string|pattern',
    },
  };

  test('should prepare a correct serializer', () => {
    const serialize = prepareSerializer<any>(schema);
    const serialized = serialize({
      foo: new Date(),
      bar: 'bar',
      item: [
        {
          wef: new Date(),
          unt: new Date(),
        },
      ],
    });

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
