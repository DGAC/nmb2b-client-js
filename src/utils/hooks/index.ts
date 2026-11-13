import type { SoapOptions } from '../../soap.ts';
import type { SoapQueryHook } from './hooks.ts';

type SoapQuery<Input, Output> = (input: Input, options?: SoapOptions) => Promise<Output>;

/**
 * {@link SoapQueryHook}, with the per-query union widened to what `applyHooks` knows at runtime.
 */
type UntypedSoapQueryHook = (hookParameters: {
  service: string;
  query: string;
  input: unknown;
}) => undefined | UntypedOnRequestEndHooks | Promise<UntypedOnRequestEndHooks>;

type UntypedOnRequestEndHooks = {
  onRequestSuccess?: (hookParameters: {
    service: string;
    query: string;
    response: unknown;
  }) => Promise<void> | void;
  onRequestError?: (hookParameters: {
    service: string;
    query: string;
    error: Error;
  }) => Promise<void> | void;
};

export function applyHooks<TInput, TOutput>({
  service,
  query,
  hooks,
  queryFn,
}: {
  service: string;
  query: string;
  hooks: Array<SoapQueryHook>;
  queryFn: SoapQuery<TInput, TOutput>;
}) {
  /**
   * The one cast between the runtime call and the per-query union of hook parameters.
   *
   * `service`, `query`, `TInput` and `TOutput` come from one query definition, whose service
   * and query names are the variant's discriminants (`createSoapServiceFromSoapClient`),
   * with `TInput` the input before `sendTime` injection and `TOutput` the reply after
   * `assertOkReply` (`buildQueryFunctionFromSoapDefinition`). Being generic, they cannot be
   * related to the union here.
   */
  const untypedHooks = hooks as Array<UntypedSoapQueryHook>;

  async function executeOnStartHooks({ input }: { input: TInput }) {
    const onSuccessHooks = [];
    const onErrorHooks = [];

    for (const onRequestStart of untypedHooks) {
      const hookResult = await onRequestStart({ service, query, input });

      if (hookResult?.onRequestSuccess) {
        onSuccessHooks.unshift(hookResult.onRequestSuccess);
      }

      if (hookResult?.onRequestError) {
        onErrorHooks.unshift(hookResult.onRequestError);
      }
    }

    return { onSuccessHooks, onErrorHooks };
  }

  const executeQuery: SoapQuery<TInput, TOutput> = async function (input, options) {
    const { onSuccessHooks, onErrorHooks } = await executeOnStartHooks({
      input,
    });

    try {
      const result = await queryFn(input, options);

      for (const onSuccess of onSuccessHooks) {
        await onSuccess({
          service,
          query,
          response: result,
        });
      }

      return result;
    } catch (err: unknown) {
      for (const onError of onErrorHooks) {
        await onError({
          service,
          query,
          error: err instanceof Error ? err : new Error('Unknown error', { cause: err }),
        });
      }

      throw err;
    }
  };

  return executeQuery;
}
