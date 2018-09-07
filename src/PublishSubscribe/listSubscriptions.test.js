/* @flow */
import { getClients } from '../../tests/utils';
import { inspect } from 'util';
import { timeFormat } from '../utils/timeFormats';
import moment from 'moment';

import { type B2BClient } from '../';
const b2bClient: B2BClient = global.__B2B_CLIENT__;
const conditionalTest = b2bClient ? test : test.skip;


jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

describe('listSubscriptions', () => {
  test('Empty test', () => {});

  xtest('list subscriptions', async () => {
    if (!b2bClient) {
      return;
    }

    const res = await b2bClient.PublishSubscribe.listSubscriptions();

    console.log(inspect(res.data, { depth: null }));

    const { data: { subscriptions: { item: subscriptions } } } = res;

    expect(subscriptions).toBeDefined();
    expect(Array.isArray(subscriptions)).toBe(true);

    subscriptions.forEach(subscription =>
      expect(subscription).toMatchObject({
        uuid: expect.any(String),
        topic: expect.any(String),
        queueName: expect.any(String),
        creationDate: expect.stringMatching(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/),
      }),
    );
  });
});
