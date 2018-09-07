/* @flow */
import { getClients } from '../../tests/utils';
import { inspect } from 'util';
import { timeFormat } from '../utils/timeFormats';
import moment from 'moment';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;

describe('createSubscriptions', () => {
  afterAll(async () => {
    if (!b2bClient) {
      return;
    }

    const res = await b2bClient.PublishSubscribe.listSubscriptions();

    const { data: { subscriptions } } = res;
    if (
      !subscriptions ||
      !subscriptions.item ||
      !Array.isArray(subscriptions.item)
    ) {
      return;
    }

    const toDelete = subscriptions.item
      .filter(({ description }) => description === '__TEST__')
      .map(({ uuid }) => uuid);

    await Promise.all(
      toDelete.map(uuid => b2bClient.PublishSubscribe.deleteSubscription({ uuid })),
    );
  });

  conditionalTest('Empty test', () => {});

  // xtest('create flight subscription', async () => {
  //   try {
  //     const res = await PubSub.createSubscription({
  //       topic: 'FLIGHT_DATA',
  //       description: '__TEST__',
  //       'messageFilter-FlightDataMessageFilter': {
  //         flightSet: { item: [{ anuIds: [{ item: 'LFEE' }] }] },
  //       },
  //     });
  //
  //     const { data: { subscription } } = res;
  //
  //     expect(subscription).toBeDefined();
  //     expect(subscription).toMatchObject({
  //       uuid: expect.any(String),
  //     });
  //
  //     const res2 = await PubSub.listSubscriptions();
  //     const { data: { subscriptions: { item: subscriptions } }} = res2;
  //
  //     expect(subscriptions).toBeDefined();
  //     const sub = subscriptions.filter(({ state, description }) => state === 'PAUSED' && description === '__TEST__');
  //     expect(sub.length).toBeGreaterThan(0);
  //
  //   } catch (err) {
  //     console.log(inspect(err, { depth: null }));
  //     throw err;
  //   }
  // });
});
