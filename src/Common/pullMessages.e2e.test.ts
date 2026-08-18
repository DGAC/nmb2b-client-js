import { describe, expect, test } from 'vitest';
import { TEST_B2B_OPTIONS } from '../../tests/options.ts';
import { shouldUseRealB2BConnection } from '../../tests/utils.ts';
import { NMB2BError, createCommonClient } from '../index.ts';

describe('pullMessages', async () => {
  const commonClient = await createCommonClient(TEST_B2B_OPTIONS);

  describe('with an unknown subscription', () => {
    test.runIf(shouldUseRealB2BConnection)(
      'should throw an INVALID_INPUT NMB2BError',
      async () => {
        const queueName = crypto.randomUUID();

        await commonClient
          .pullMessages({
            queueName,
            maxSize: 1,
            destructive: true,
          })
          .then(
            () => {
              expect.unreachable();
            },
            (err: unknown) => {
              expect(err).toBeInstanceOf(NMB2BError);
              expect(err).toEqual(
                expect.objectContaining({
                  status: 'INVALID_INPUT',
                  inputValidationErrors: [
                    expect.objectContaining({
                      message: expect.stringContaining(queueName),
                      type: 'INVALID_QUEUENAME',
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
