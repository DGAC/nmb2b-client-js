import { expect, test } from '@jest/globals';
import { inspect } from 'util';
import { makeFlightClient, makeFlowClient } from '..';
import moment from 'moment';
import b2bOptions from '../../tests/options';
import { FlightService } from '.';
import { FlowService } from '../Flow';
import { Regulation } from '../Flow/types';
import { JestAssertionError } from 'expect';
jest.setTimeout(20000);

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;

let Flight: FlightService;
let Flow: FlowService;
beforeAll(async () => {
  [Flight, Flow] = await Promise.all([
    makeFlightClient(b2bOptions),
    makeFlowClient(b2bOptions),
  ]);
});

describe('queryFlightsByMeasure', () => {
  let measure: void | Regulation;

  beforeAll(async () => {
    const res = await Flow.queryRegulations({
      dataset: { type: 'OPERATIONAL' },
      queryPeriod: {
        wef: moment.utc().subtract(2, 'hour').startOf('hour').toDate(),
        unt: moment.utc().add(10, 'hour').startOf('hour').toDate(),
      },
      requestedRegulationFields: {
        item: ['applicability', 'location', 'reason'],
      },
    });

    // console.log(res.data.regulations.item);

    const hasAirspaceMatching = (regex: RegExp) => (item: any) =>
      item &&
      item.location &&
      item.location['referenceLocation-ReferenceLocationAirspace'] &&
      item.location['referenceLocation-ReferenceLocationAirspace'].id &&
      regex.test(
        item.location['referenceLocation-ReferenceLocationAirspace'].id,
      );

    if (!res.data.regulations?.item || !res.data.regulations?.item.length) {
      return;
    }

    measure = res.data.regulations.item[0];

    // console.log(inspect(measure, { depth: null }));
  });

  conditionalTest('query in regulation', async () => {
    if (!measure || !measure.regulationId || !measure.applicability) {
      console.warn('No measure was found, cannot query flights by measure');
      return;
    }

    try {
      const res = await Flight.queryFlightsByMeasure({
        dataset: { type: 'OPERATIONAL' },
        includeProposalFlights: false,
        includeForecastFlights: false,
        trafficType: 'LOAD',
        trafficWindow: measure.applicability,
        measure: { REGULATION: measure.regulationId },
        mode: 'CONCERNED_BY_MEASURE',
      });

      expect(res.data.effectiveTrafficWindow).toEqual(measure.applicability);
      expect(res.data?.flights).toEqual(expect.any(Array));
      for (const flight of res.data?.flights) {
        expect(flight).toMatchObject({
          flight: {
            flightId: {
              id: expect.any(String),
              keys: {
                aircraftId: expect.any(String),
                aerodromeOfDeparture: expect.stringMatching(/^[A-Z]{4}$/),
                aerodromeOfDestination: expect.stringMatching(/^[A-Z]{4}$/),
                estimatedOffBlockTime: expect.any(Date),
              },
            },
          },
        });
      }
    } catch (err) {
      if (err instanceof JestAssertionError) {
        throw err;
      }

      console.log(inspect(err, { depth: 4 }));
      throw err;
    }
  });
});
