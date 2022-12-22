import { PublishSubscribeService } from '.';
import { makePublishSubscribeClient } from '..';
import b2bOptions from '../../tests/options';
jest.setTimeout(20000);

const conditionalTest = (global as any).__DISABLE_B2B_CONNECTIONS__
  ? test.skip
  : test;

let PublishSubscribe: PublishSubscribeService;
beforeAll(async () => {
  PublishSubscribe = await makePublishSubscribeClient(b2bOptions);
});

// TODO: Check this
describe.skip('createSubscriptions', () => {
  afterAll(async () => {
    const res = await PublishSubscribe.listSubscriptions();

    const {
      data: { subscriptions },
    } = res;
    if (
      !subscriptions ||
      !subscriptions.item ||
      !Array.isArray(subscriptions.item)
    ) {
      return;
    }

    const toDelete: string[] = subscriptions.item
      .filter(({ description }) => description === '__TEST__')
      .map(({ uuid }) => uuid);

    await Promise.all(
      toDelete.map((uuid) => PublishSubscribe.deleteSubscription({ uuid })),
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
