import { describe, expectTypeOf, test } from 'vitest';
import type { FlowService } from '../../src/Flow/index.ts';
import type {
  RecordedExchange,
  FixtureRunFn,
  FixtureTestContext,
  RecordedReply,
  RecordedRequest,
} from './fixtures.ts';
import { defineFixture } from './fixtures.ts';

type OTMVPlanReply = Awaited<ReturnType<FlowService['retrieveOTMVPlan']>>;

describe('defineFixture', () => {
  test('infers the result seen by .test() from what .run() returns', () => {
    defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
      .run(() => Promise.resolve({ result: { narrowed: true as const } }))
      .test('result', ({ result }) => {
        expectTypeOf(result).toEqualTypeOf<{ narrowed: true }>();
      });
  });

  test('infers the result type of a record() call returned as is', () => {
    defineFixture({ service: 'Flow', method: 'retrieveOTMVPlan' })
      .run((client, _variables, { record }) =>
        record('retrieveOTMVPlan', () =>
          client.Flow.retrieveOTMVPlan({ dataset: { type: 'OPERATIONAL' }, day: new Date() }),
        ),
      )
      .test('result', ({ result }) => {
        expectTypeOf(result).toEqualTypeOf<OTMVPlanReply>();
      });
  });

  test('rejects a .run() that does not return { result }', () => {
    const run = () => Promise.resolve('bare result');

    expectTypeOf(run).not.toExtend<FixtureRunFn<undefined, unknown>>();
  });

  test('exposes the exchanges to .test()', () => {
    expectTypeOf<FixtureTestContext<unknown, unknown>>().toHaveProperty('exchanges');
  });
});

describe('RecordedExchange', () => {
  test('cannot be built by hand', () => {
    const exchange: RecordedExchange = {
      // @ts-expect-error -- recorded requests are only produced by the harness
      request: { body: '<request/>' },
      // @ts-expect-error -- recorded replies are only produced by the harness
      reply: { body: '<reply/>' },
    };

    expectTypeOf(exchange).toEqualTypeOf<RecordedExchange>();
  });

  test('does not mix up a recorded request and a recorded reply', () => {
    expectTypeOf<RecordedRequest>().not.toExtend<RecordedReply>();
    expectTypeOf<RecordedReply>().not.toExtend<RecordedRequest>();
  });

  test('does not pass for a string: the raw body is read from `body`', () => {
    expectTypeOf<RecordedRequest>().not.toExtend<string>();
    expectTypeOf<RecordedReply>().not.toExtend<string>();
    expectTypeOf<RecordedRequest['body']>().toEqualTypeOf<string>();
    expectTypeOf<RecordedReply['body']>().toEqualTypeOf<string>();
  });
});
