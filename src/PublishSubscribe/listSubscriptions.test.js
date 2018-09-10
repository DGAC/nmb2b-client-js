/* @flow */
import { inspect } from 'util';
import { makePublishSubscribeClient, type B2BClient } from '../';
import moment from 'moment';
import b2bOptions from '../../tests/options';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

import type { SubscriptionListReply } from './listSubscriptions';

const conditionalTest = global.__DISABLE_B2B_CONNECTIONS__ ? test.skip : test;

let PublishSubscribe: $PropertyType<B2BClient, 'PublishSubscribe'>;
beforeAll(async () => {
  PublishSubscribe = await makePublishSubscribeClient(b2bOptions);
});

describe('listSubscriptions', () => {
  test('Empty test', () => {});

  xtest('list subscriptions', async () => {
    const res: SubscriptionListReply = await PublishSubscribe.listSubscriptions();

    console.log(inspect(res.data, { depth: null }));

    const {
      data: {
        // $FlowFixMe
        subscriptions: { item: subscriptions },
      },
    } = res;

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
