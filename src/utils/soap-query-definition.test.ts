import { fromPartial } from '@total-typescript/shoehorn';
import { AssertionError } from 'node:assert';
import type { Client as SoapClient } from 'soap';
import { assert, describe, expect, test, vi } from 'vitest';
import { createHook, NMB2BError } from '../index.js';
import type { B2BRequest, ReplyWithData } from '../types.js';
import type { SoapQueryHook } from '../utils/hooks/hooks.js';
import {
  createSoapQueryDefinition,
  createSoapServiceFromSoapClient,
} from './soap-query-definition.js';

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

      expect(onRequestError).toHaveBeenCalledExactlyOnceWith({
        service: 'test-service',
        query: 'testSoapQuery',
        error: new Error(
          '[Query test-service.testSoapQuery] Error thrown during query execution: Test error',
          { cause: error },
        ),
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

describe('error handling', () => {
  describe('when a request throws an error', () => {
    test('should throw the original error', async () => {
      const { soapService, executeQuery } = withMockedSoapService();

      const error = new Error('Test error');
      executeQuery.mockRejectedValueOnce(error);

      try {
        await soapService.soapQuery({ foo: 'bar' });
        expect.unreachable('soapService call must throw');
      } catch (err) {
        assert(err instanceof Error);
        expect(err.cause).toBe(error);
        expect(err.message).toMatch(/error thrown/i);
        expect(err.message).toMatch(/Test error/);
      }
    });
  });

  describe('when a request throws a non error', () => {
    test('should throw an error instance, with the original thrown object as `cause`', async () => {
      const { soapService, executeQuery } = withMockedSoapService();

      const error = 'non-error';
      executeQuery.mockRejectedValueOnce(error);

      try {
        await soapService.soapQuery({ foo: 'bar' });
        expect.unreachable('soapService call must throw');
      } catch (err) {
        assert(err instanceof Error);
        expect(err.cause).toBe(error);
        expect(err.message).toMatch(/error thrown/i);
        expect(err.message).toMatch(/Unknown error/);
      }
    });
  });

  describe('when a request returns an error response', () => {
    test('should throw a NMB2BError', async () => {
      const { soapService, executeQuery } = withMockedSoapService();

      executeQuery.mockResolvedValueOnce([
        fromPartial({ status: 'INVALID_INPUT' }),
      ]);

      await expect(async () =>
        soapService.soapQuery({ foo: 'bar' }),
      ).rejects.toEqual(new NMB2BError({ reply: { status: 'INVALID_INPUT' } }));
    });
  });

  describe('when a request returns an invalid response', () => {
    test('should throw an AssertionError', async () => {
      const { soapService, executeQuery } = withMockedSoapService();

      executeQuery.mockResolvedValueOnce([
        // oxlint-disable-next-line no-explicit-any no-unsafe-type-assertion
        null as any,
      ]);

      await expect(async () =>
        soapService.soapQuery({ foo: 'bar' }),
      ).rejects.toEqual(expect.any(AssertionError));
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
    // oxlint-disable-next-line require-await
    async (
      input: B2BRequest & { foo: string },
    ): Promise<[ReplyWithData<{ bar: string }>]> => [
      fromPartial({
        status: 'OK',
        data: { bar: input.foo },
      }),
    ],
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
