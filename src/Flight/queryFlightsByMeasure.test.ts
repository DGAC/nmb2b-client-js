import { inspect } from 'util';
import { makeFlightClient, makeFlowClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
import { flightPlanToFlightKeys } from './utils';
import { FlightService } from '.';
import { FlowService } from '../Flow';
import { Regulation } from '../Flow/types';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

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
  let measure: Regulation;

  beforeAll(async () => {
    const res = await Flow.queryRegulations({
      dataset: { type: 'OPERATIONAL' },
      queryPeriod: {
        wef: moment
          .utc()
          .subtract(2, 'hour')
          .startOf('hour')
          .toDate(),
        unt: moment
          .utc()
          .add(10, 'hour')
          .startOf('hour')
          .toDate(),
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

    measure = res.data.regulations.item[0];
    // console.log(inspect(measure, { depth: null }));
  });

  // Not authorised with current certificate in OPS
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

      // !process.env.CI && console.log(res.data);
    } catch (err) {
      console.log(inspect(err, { depth: null }));
      throw err;
    }
  });
});
