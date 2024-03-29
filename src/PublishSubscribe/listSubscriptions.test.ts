import { describe, expect, test } from 'vitest';
import { makePublishSubscribeClient } from '..';
import b2bOptions from '../../tests/options';
import { SubscriptionListReply } from './listSubscriptions';

describe('listSubscriptions', async () => {
  const PublishSubscribe = await makePublishSubscribeClient(b2bOptions);

  test.skip('List subscriptions', async () => {
    const res: SubscriptionListReply =
      await PublishSubscribe.listSubscriptions();

    // console.log(inspect(res.data, { depth: 4 }));

    if (!res.data.subscriptions) {
      console.warn('No subscriptions attached to this certificate');
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
