/* @flow */
import { inspect } from 'util';
import { makeAirspaceClient } from '../';
import moment from 'moment';
import b2bOptions from '../../tests/options';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const conditionalTest = global.__DISABLE_B2B_CONNECTIONS__ ? test.skip : test;

let Airspace;
beforeAll(async () => {
  Airspace = await makeAirspaceClient(b2bOptions);
});

describe('retrieveAUPChain', () => {
  conditionalTest('AUP Retrieval', async () => {
    const res = await Airspace.retrieveAUPChain({
      amcIds: ['LFFAZAMC'],
      chainDate: new Date(),
    });

    expect(Array.isArray(res.data.chains)).toBe(true);
  });
});
