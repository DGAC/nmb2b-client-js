import type { SoapOptions } from '../../soap.js';
import type { SoapQueryHook } from './hooks.js';

type SoapQuery<Input, Output> = (
  input: Input,
  options?: SoapOptions,
) => Promise<Output>;

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
  async function executeOnStartHooks({ input }: { input: TInput }) {
    const onSuccessHooks = [];
    const onErrorHooks = [];

    for (const onRequestStart of hooks) {
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

  const executeQuery: SoapQuery<TInput, TOutput> = async function (
    input,
    options,
  ) {
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
          error:
            err instanceof Error
              ? err
              : new Error('Unknown error', { cause: err }),
        });
      }

      throw err;
    }
  };

  return executeQuery;
}
