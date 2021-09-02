import { inspect } from 'util';
import { makePublishSubscribeClient, B2BClient } from '..';
import moment from 'moment';
// @ts-ignore
import b2bOptions from '../../tests/options';
jest.setTimeout(20000);

import { SubscriptionListReply } from './listSubscriptions';
import { PublishSubscribeService } from '.';

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;

let PublishSubscribe: PublishSubscribeService;
beforeAll(async () => {
  PublishSubscribe = await makePublishSubscribeClient(b2bOptions);
});

describe('listSubscriptions', () => {
  test('Empty test', () => {});

  xtest('list subscriptions', async () => {
    const res: SubscriptionListReply = await PublishSubscribe.listSubscriptions();

    console.log(inspect(res.data, { depth: null }));

    if (!res.data.subscriptions) {
      return;
    }

    const {
      data: {
        subscriptions: { item: subscriptions },
      },
    } = res;

    expect(subscriptions).toBeDefined();
    expect(Array.isArray(subscriptions)).toBe(true);

    subscriptions.forEach((subscription: any) =>
      expect(subscription).toMatchObject({
        uuid: expect.any(String),
        topic: expect.any(String),
        queueName: expect.any(String),
        creationDate: expect.stringMatching(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/),
      }),
    );
  });
});
