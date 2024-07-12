/**
 * Type helper to recursively make potentially empty objects nullable.
 *
 * {@see https://github.com/DGAC/nmb2b-client-js/issues/149}
 */
export type CollapseEmptyObjectsToNull<TInput> =
  Record<string, never> extends TInput
    ?
        | { [TKey in keyof TInput]: CollapseEmptyObjectsToNull<TInput[TKey]> }
        | null
    : TInput extends Record<string, unknown>
      ? { [TKey in keyof TInput]: CollapseEmptyObjectsToNull<TInput[TKey]> }
      : TInput;
