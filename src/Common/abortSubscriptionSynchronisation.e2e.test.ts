import { describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../../tests/options.ts';
import { shouldUseRealB2BConnection } from '../../tests/utils.ts';
import { NMB2BError, createCommonClient } from '../index.ts';

describe('abortSubscriptionSynchronisation', async () => {
  const commonClient = await createCommonClient(TEST_B2B_OPTIONS);

  describe('with an unknown subscription', () => {
    test.runIf(shouldUseRealB2BConnection)(
      'should throw an OBJECT_NOT_FOUND NMB2BError',
      async () => {
        await commonClient
          .abortSubscriptionSynchronisation({
            subscriptionUuid: crypto.randomUUID(),
          })
          .then(
            () => {
              expect.unreachable();
            },
            (err: unknown) => {
              expect(err).toBeInstanceOf(NMB2BError);
              expect(err).toEqual(
                expect.objectContaining({
                  status: 'OBJECT_NOT_FOUND',
                  inputValidationErrors: [
                    expect.objectContaining({
                      type: 'UNKNOWN_SUBSCRIPTION',
                    }),
                  ],
                }),
              );
            },
          );
      },
    );
  });
});
