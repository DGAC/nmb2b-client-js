import { createClientAsync, type Client as SoapClient } from 'soap';
import type { B2BRequest, Reply } from '../Common/types.js';
import type { SoapOptions } from '../soap.js';
import { applyHooks } from './hooks/index.js';
import {
  assertOkReply,
  injectSendTime,
  type WithInjectedSendTime,
} from './internals.js';
import { prepareSerializer } from './transformers/serializer.js';
import { getSoapEndpoint, type Config } from '../config.js';
import { getServiceWSDLFilePath } from './xsd/paths.js';
import { prepareSecurity } from '../security.js';
import { deserializer as customDeserializer } from '../utils/transformers/index.js';
import { assert } from './assert.js';
import type { SoapQueryHook } from './hooks/hooks.js';
import { logHook } from './hooks/withLog.js';
import { AssertionError } from 'node:assert';
import { NMB2BError } from './NMB2BError.js';

export type SoapQueryDefinition<
  TInput extends B2BRequest,
  TResult extends Reply,
> = {
  /**
   * Name of the service.
   */
  service: string;

  /**
   * Name of the query.
   *
   * Will be used to infer the soap-client query function name if `executeQuery` is not defined.
   */
  query: string;

  /**
   * Given a SoapClient, return the schema for the input of this query.
   *
   * Will be used to build a serializer.
   */
  getSchema: (client: SoapClient) => unknown;

  /**
   * Optional getter to extract the correct query function from a `SoapClient`.
   *
   * By default, will use `SoapClient[${query}Async]`
   */
  executeQuery?: (
    client: SoapClient,
  ) => (values: TInput, options?: SoapOptions) => Promise<[TResult]>;
};

export function createSoapQueryDefinition<
  TInput extends B2BRequest,
  TResult extends Reply,
>(queryDefinition: SoapQueryDefinition<TInput, TResult>) {
  return queryDefinition;
}

export async function createSoapService<
  TDefinitions extends ServiceDefinition,
>({
  serviceName,
  config,
  queryDefinitions,
}: {
  serviceName: string;
  config: Config;
  queryDefinitions: TDefinitions;
}): Promise<SoapService<TDefinitions>> {
  const WSDL = getServiceWSDLFilePath({
    service: serviceName,
    flavour: config.flavour,
    XSD_PATH: config.XSD_PATH,
    xsdEndpoint: config.xsdEndpoint,
  });

  const security = prepareSecurity(config);

  const client = await createClientAsync(WSDL, { customDeserializer });
  client.setSecurity(security);
  if (config.endpoint) {
    client.setEndpoint(getSoapEndpoint(config));
  }

  return createSoapServiceFromSoapClient({ config, client, queryDefinitions });
}

export function createSoapServiceFromSoapClient<
  TDefinitions extends ServiceDefinition,
>({
  client,
  config,
  queryDefinitions,
}: {
  client: SoapClient;
  config: Config;
  queryDefinitions: TDefinitions;
}): SoapService<TDefinitions> {
  const soapQueryFunctions = Object.fromEntries(
    Object.entries(queryDefinitions).map(([queryName, queryDefinition]) => [
      queryName,
      buildQueryFunctionFromSoapDefinition({
        queryDefinition,
        client,
        hooks: [logHook, ...config.hooks],
      }),
    ]),
  );

  return {
    __soapClient: client,
    config,
    ...soapQueryFunctions,
  } as SoapService<TDefinitions>;
}

export type SoapService<TDefinitions extends ServiceDefinition> = {
  readonly __soapClient: SoapClient;
  readonly config: Config;
  /** @internal */
  readonly __definitions: TDefinitions;
} & {
  [TKey in keyof TDefinitions]: ExtractSoapQuery<TDefinitions[TKey]>;
};

export type ExtractQueryDefinitions<TService> = TService extends {
  readonly __definitions: infer TDefinitions;
}
  ? TDefinitions
  : never;

function buildQueryFunctionFromSoapDefinition<
  TInput extends B2BRequest,
  TResult extends Reply,
>({
  queryDefinition,
  client,
  hooks,
}: {
  queryDefinition: SoapQueryDefinition<TInput, TResult>;
  client: SoapClient;
  hooks: Array<SoapQueryHook>;
}): (
  input: WithInjectedSendTime<TInput>,
  options?: SoapOptions,
) => Promise<TResult> {
  const schema = queryDefinition.getSchema(client);

  assert(
    typeof schema === 'object' && schema !== null,
    `Could not find serializer for query ${queryDefinition.service}.${queryDefinition.query}`,
  );

  const serializer = prepareSerializer<TInput>(schema);

  let queryFn = queryDefinition.executeQuery
    ? queryDefinition.executeQuery(client)
    : (client[`${queryDefinition.query}Async`] as
        | undefined
        | ((values: TInput, options?: SoapOptions) => Promise<[TResult]>));

  assert(
    typeof queryFn === 'function',
    `Could not find query function for query ${queryDefinition.service}.${queryDefinition.query}`,
  );

  queryFn = queryFn.bind(client);

  return applyHooks<WithInjectedSendTime<TInput>, TResult>({
    service: queryDefinition.service,
    query: queryDefinition.query,
    hooks: hooks,
    queryFn: async (input, options?): Promise<TResult> => {
      try {
        const withSendTime: TInput = injectSendTime(input);

        const [result] = await queryFn(serializer(withSendTime), options);

        assertOkReply(result);
        return result;
      } catch (err: unknown) {
        if (err instanceof AssertionError || err instanceof NMB2BError) {
          throw err;
        }

        throw new Error(
          `[Query ${queryDefinition.service}.${queryDefinition.query}] Error thrown during query execution: ${err instanceof Error ? err.message : 'Unknown error'}`,
          { cause: err },
        );
      }
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceDefinition = Record<string, SoapQueryDefinition<any, any>>;

type ExtractSoapQuery<T extends SoapQueryDefinition<B2BRequest, Reply>> =
  T extends SoapQueryDefinition<infer TInput, infer TResult>
    ? (
        input: WithInjectedSendTime<TInput>,
        options?: SoapOptions,
      ) => Promise<TResult>
    : never;
