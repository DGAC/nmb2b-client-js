/**
 * A hook that will be executed when a query starts.
 *
 * A hook can return an object with optional properties :
 * - `onRequestSuccess`: a hook executed when the query is successful
 * - `onRequestError`: a hook executed when the query fails
 *
 * All hooks can be sync or async.
 *
 * @see {@link OnRequestEndHooks}
 * @see {@link OnRequestStartParameters}
 * @see {@link OnRequestSuccessParameters}
 * @see {@link OnRequestErrorParameters}
 */
export type SoapQueryHook = (
  hookParameters: OnRequestStartParameters,
) => void | OnRequestEndHooks | Promise<OnRequestEndHooks>;

type HookParameters = {
  /**
   * The name of the service executing the query.
   */
  service: string;

  /**
   * The name of the query being executed.
   */
  query: string;
};

type OnRequestStartParameters = HookParameters & { input: unknown };

type OnRequestSuccessParameters = HookParameters & { response: unknown };

type OnRequestErrorParameters = HookParameters & { error: Error };

type OnRequestEndHooks = {
  onRequestSuccess?: (
    hookParameters: OnRequestSuccessParameters,
  ) => Promise<void> | void;
  onRequestError?: (
    hookParameters: OnRequestErrorParameters,
  ) => Promise<void> | void;
};

export function createHook(hookFn: SoapQueryHook): SoapQueryHook {
  return hookFn;
}
