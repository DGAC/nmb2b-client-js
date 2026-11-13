import type { B2BClient } from '../../createB2BClient.ts';
import type { WithInjectedSendTime } from '../internals.ts';
import type { ExtractQueryDefinitions, SoapQueryDefinition } from '../soap-query-definition.ts';
import type { Prettify } from '../types.ts';

/**
 * A hook that will be executed when a query starts.
 *
 * A hook can return an object with optional properties :
 * - `onRequestSuccess`: a hook executed when the query is successful
 * - `onRequestError`: a hook executed when the query fails
 *
 * All hooks can be sync or async.
 *
 * Hook parameters are a union with one variant per query, discriminated by `service` and `query`:
 * narrowing on both types `input` and `response` as the caller of that query sees them.
 *
 * @see {@link OnRequestEndHooks}
 * @see {@link OnRequestStartParameters}
 * @see {@link OnRequestSuccessParameters}
 * @see {@link OnRequestErrorParameters}
 */
export type SoapQueryHook = (
  hookParameters: OnRequestStartParameters,
) => undefined | OnRequestEndHooks | Promise<OnRequestEndHooks>;

/**
 * The services whose queries run hooks, keyed by the `service` name hooks receive.
 */
type HookedServices = B2BClient;

type ServiceQueryHookParameters<TService extends keyof HookedServices> = {
  [
    TQuery in keyof ExtractQueryDefinitions<HookedServices[TService]> & string
  ]: ExtractQueryDefinitions<HookedServices[TService]>[TQuery] extends SoapQueryDefinition<
    infer TInput,
    infer TResult
  >
    ? {
        /**
         * The name of the service executing the query.
         */
        service: TService;

        /**
         * The name of the query being executed.
         */
        query: TQuery;

        /**
         * The input given by the caller, before `sendTime` injection and serialization.
         */
        input: WithInjectedSendTime<TInput>;

        /**
         * The deserialized reply, as returned to the caller.
         */
        response: TResult & { status: 'OK' };
      }
    : never;
}[keyof ExtractQueryDefinitions<HookedServices[TService]> & string];

/**
 * One variant per query of the client, discriminated by `service` and `query`.
 */
type QueryHookParameters = {
  [TService in keyof HookedServices]: ServiceQueryHookParameters<TService>;
}[keyof HookedServices];

/**
 * `Omit` applied to each variant of a union, which `Omit` alone would merge into one object.
 */
type DistributiveOmit<T, TKey extends PropertyKey> = T extends unknown ? Omit<T, TKey> : never;

export type OnRequestStartParameters = DistributiveOmit<QueryHookParameters, 'response'>;

export type OnRequestSuccessParameters = DistributiveOmit<QueryHookParameters, 'input'>;

export type OnRequestErrorParameters = Prettify<
  DistributiveOmit<QueryHookParameters, 'input' | 'response'> & { error: Error }
>;

type OnRequestEndHooks = {
  onRequestSuccess?: (hookParameters: OnRequestSuccessParameters) => Promise<void> | void;
  onRequestError?: (hookParameters: OnRequestErrorParameters) => Promise<void> | void;
};

export function createHook(hookFn: SoapQueryHook): SoapQueryHook {
  return hookFn;
}
