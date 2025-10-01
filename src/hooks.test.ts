import { fromPartial } from '@total-typescript/shoehorn';
import type { Client as SoapClient } from 'soap';
import { describe, expect, test, vi } from 'vitest';
import { createHook } from './index.js';
import type { B2BRequest, ReplyWithData } from './types.js';
import type { SoapQueryHook } from './utils/hooks/hooks.js';
import {
  createSoapQueryDefinition,
  createSoapServiceFromSoapClient,
} from './utils/soap-query-definition.js';

describe('hooks', () => {
  describe('when a request starts', () => {
    test('should call `onRequestStart()` with the expected parameters', async () => {
      const hook = createHook(vi.fn());
      const { soapService } = withMockedSoapService({ hooks: [hook] });

      const input = { foo: 'bar' };
      await soapService.soapQuery(input);

      expect(hook).toHaveBeenCalledWith({
        service: 'test-service',
        query: 'testSoapQuery',
        input,
      });
    });
  });

  describe('when a request succeeds', () => {
    test('should call `onRequestSuccess()` with the expected parameters', async () => {
      const onRequestSuccess = vi.fn();
      const onRequestError = vi.fn();
      const onRequestStart = createHook(
        vi.fn(() => ({ onRequestSuccess, onRequestError })),
      );

      const { soapService, executeQuery } = withMockedSoapService({
        hooks: [onRequestStart],
      });

      const input = { foo: 'bar' };
      const output = { status: 'OK' as const, data: { bar: 'baz' } };
      executeQuery.mockResolvedValueOnce([output]);

      await soapService.soapQuery(input);

      expect(onRequestSuccess).toHaveBeenCalledWith({
        service: 'test-service',
        query: 'testSoapQuery',
        response: output,
      });

      expect(onRequestError).not.toHaveBeenCalled();
      expect(onRequestStart).toHaveBeenCalledBefore(onRequestSuccess);
    });
  });

  describe('when a request fails', () => {
    test('should call `onRequestError()` with the expected parameters', async () => {
      const onRequestError = vi.fn();
      const onRequestSuccess = vi.fn();
      const onRequestStart = createHook(
        vi.fn(() => ({ onRequestSuccess, onRequestError })),
      );

      const { soapService, executeQuery } = withMockedSoapService({
        hooks: [onRequestStart],
      });

      const input = { foo: 'bar' };
      const error = new Error('Test error');
      executeQuery.mockRejectedValueOnce(error);

      try {
        await soapService.soapQuery(input);
        expect.unreachable('Expected the soap query to throw');
      } catch {
        // Do nothing
      }

      expect(onRequestError).toHaveBeenCalledWith({
        service: 'test-service',
        query: 'testSoapQuery',
        error,
      });

      expect(onRequestSuccess).not.toHaveBeenCalled();
      expect(onRequestStart).toHaveBeenCalledBefore(onRequestError);
    });
  });

  describe('with multiple hooks', () => {
    describe('when a request starts', () => {
      test('should call `onRequestStart` in the correct order', async () => {
        const firstHook = vi.fn();
        const secondHook = vi.fn();
        const thirdHook = vi.fn();

        const { soapService } = withMockedSoapService({
          hooks: [firstHook, secondHook, thirdHook],
        });

        await soapService.soapQuery({ foo: 'bar' });

        expect(firstHook).toHaveBeenCalledBefore(secondHook);
        expect(secondHook).toHaveBeenCalledBefore(thirdHook);
      });
    });

    /**
     * We expect onRequestSuccess/onRequestError to be called in the reverse order of hook installation,
     * a bit like express middlewares.
     */
    describe('when a request succeeds', () => {
      test('should call `onRequestSuccess` in the correct order', async () => {
        const firstHook = vi.fn();
        const secondHook = vi.fn();
        const thirdHook = vi.fn();

        const { soapService } = withMockedSoapService({
          hooks: [
            () => ({ onRequestSuccess: firstHook }),
            () => ({ onRequestSuccess: secondHook }),
            () => ({ onRequestSuccess: thirdHook }),
          ],
        });

        await soapService.soapQuery({ foo: 'bar' });

        expect(thirdHook).toHaveBeenCalledBefore(secondHook);
        expect(secondHook).toHaveBeenCalledBefore(firstHook);
      });
    });

    describe('when a request fails', () => {
      test('should call `onRequestError` in the correct order', async () => {
        const firstHook = vi.fn();
        const secondHook = vi.fn();
        const thirdHook = vi.fn();

        const { soapService, executeQuery } = withMockedSoapService({
          hooks: [
            () => ({ onRequestError: firstHook }),
            () => ({ onRequestError: secondHook }),
            () => ({ onRequestError: thirdHook }),
          ],
        });

        executeQuery.mockRejectedValueOnce(new Error());

        try {
          await soapService.soapQuery({ foo: 'bar' });
          expect.unreachable('Expected the soap query to throw');
        } catch {
          // Do nothing
        }

        expect(thirdHook).toHaveBeenCalledBefore(secondHook);
        expect(secondHook).toHaveBeenCalledBefore(firstHook);
      });
    });
  });
});

function withMockedSoapService({
  hooks = [],
}: {
  hooks?: Array<SoapQueryHook>;
} = {}) {
  const client: SoapClient = fromPartial({});

  const executeQuery = vi.fn(
    async (
      input: B2BRequest & { foo: string },
    ): Promise<[ReplyWithData<{ bar: string }>]> =>
      Promise.resolve([
        fromPartial({
          status: 'OK',
          data: { bar: input.foo },
        }),
      ]),
  );

  const queryDefinitions = {
    soapQuery: createSoapQueryDefinition({
      service: 'test-service',
      query: 'testSoapQuery',
      getSchema: () => ({}),
      executeQuery: () => executeQuery,
    }),
  };

  const soapService = createSoapServiceFromSoapClient({
    client,
    config: fromPartial({ hooks }),
    queryDefinitions,
  });

  return {
    executeQuery,
    soapService,
  };
}

// const client = await createB2BClient({
//   onRequestStart: () => {
//     console.log('Request started');
//
//     return {
//       onRequestSuccess: async () => {},
//       onRequestError: () => {
//         console.log('Request error');
//       },
//     };
//   },
// });
