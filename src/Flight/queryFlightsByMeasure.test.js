/* @flow */
import { getClients } from '../../tests/utils';
import { inspect } from 'util';
import { flightPlanToFlightKeys } from './utils';
import { timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

describe('queryFlightsByMeasure', () => {
  let measureId;

  beforeAll(async () => {
    if (!b2bClient) {
      return;
    }

    const { Flight, Flow } = b2bClient;

    const res = await Flow.queryRegulations({
      dataset: { type: 'OPERATIONAL' },
      queryPeriod: {
        wef: moment
          .utc()
          .subtract(10, 'hour')
          .startOf('hour')
          .toDate(),
        unt: moment
          .utc()
          .add(10, 'hour')
          .startOf('hour')
          .toDate(),
      },
      requestedRegulationFields: { item: ['location', 'reason'] },
    });

    // console.log(res.data.regulations.item);

    const hasAirspaceMatching = regex => item =>
      item &&
      item.location &&
      // $FlowFixMe
      item.location['referenceLocation-ReferenceLocationAirspace'] &&
      item.location['referenceLocation-ReferenceLocationAirspace'].id &&
      regex.test(
        item.location['referenceLocation-ReferenceLocationAirspace'].id,
      );

    const measure = res.data.regulations.item.find(hasAirspaceMatching(/LFE/));
    // console.log(inspect(measure, { depth: null }));

    measureId = measure.regulationId;
  });

  // Not authorised with current certificate
  conditionalTest('query in regulation', async () => {
    if (!measureId) {
      console.warn('No measure was found, cannot query flights by measure');
      return;
    }

    const { Flight } = b2bClient;

    try {
      const res = await Flight.queryFlightsByMeasure({
        dataset: { type: 'OPERATIONAL' },
        includeProposalFlights: false,
        includeForecastFlights: false,
        trafficType: 'LOAD',
        trafficWindow: {
          wef: moment
            .utc()
            .subtract(1, 'hour')
            .startOf('hour')
            .toDate(),
          unt: moment
            .utc()
            .add(1, 'hour')
            .startOf('hour')
            .toDate(),
        },
        measure: { REGULATION: measureId },
        mode: 'CONCERNED_BY_MEASURE',
      });

      console.log(res.data);
    } catch (err) {
      console.log(inspect(err, { depth: null }));
      throw err;
    }
  });
});
