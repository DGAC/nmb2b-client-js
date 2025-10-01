import { createClientAsync, type Client as SoapClient } from 'soap';
import type { B2BRequest, Reply } from '../Common/types.js';
import type { SoapOptions } from '../soap.js';
import { instrument } from './instrumentation/index.js';
import {
  assertOkReply,
  injectSendTime,
  type WithInjectedSendTime,
} from './internals.js';
import { prepareSerializer } from './transformers/serializer.js';
import type { Config } from '../config.js';
import { getWSDLPath } from '../constants.js';
import { prepareSecurity } from '../security.js';
import { deserializer as customDeserializer } from '../utils/transformers/index.js';
import { assert } from './assert.js';

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
  const WSDL = getWSDLPath({
    service: serviceName,
    flavour: config.flavour,
    XSD_PATH: config.XSD_PATH,
  });

  const security = prepareSecurity(config);

  const client = await createClientAsync(WSDL, { customDeserializer });
  client.setSecurity(security);

  const soapQueryFunctions = Object.fromEntries(
    Object.entries(queryDefinitions).map(([queryName, queryDefinition]) => [
      queryName,
      buildQueryFunctionFromSoapDefinition({ queryDefinition, client }),
    ]),
  );

  return {
    __soapClient: client,
    config,
    ...soapQueryFunctions,
  } as SoapService<TDefinitions>;
}

export type SoapService<TDefinitions extends ServiceDefinition> = {
  __soapClient: SoapClient;
  config: Config;
} & {
  [TKey in keyof TDefinitions]: ExtractSoapQuery<TDefinitions[TKey]>;
};

function buildQueryFunctionFromSoapDefinition<
  TInput extends B2BRequest,
  TResult extends Reply,
>({
  queryDefinition,
  client,
}: {
  queryDefinition: SoapQueryDefinition<TInput, TResult>;
  client: SoapClient;
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

  const queryFn = queryDefinition.executeQuery
    ? queryDefinition.executeQuery(client).bind(client)
    : (client[`${queryDefinition.query}Async`] as
        | undefined
        | ((values: TInput, options?: SoapOptions) => Promise<[TResult]>));

  assert(
    typeof queryFn === 'function',
    `Could not find query function for query ${queryDefinition.service}.${queryDefinition.query}`,
  );

  return instrument<WithInjectedSendTime<TInput>, TResult>({
    service: queryDefinition.service,
    query: queryDefinition.query,
  })(async (input, options?): Promise<TResult> => {
    const withSendTime: TInput = injectSendTime(input);

    const [result] = await queryFn(serializer(withSendTime), options);

    assertOkReply(result);
    return result;
  });
}

type ServiceDefinition = Record<string, SoapQueryDefinition<any, any>>;

type ExtractSoapQuery<T extends SoapQueryDefinition<B2BRequest, Reply>> =
  T extends SoapQueryDefinition<infer TInput, infer TResult>
    ? (input: WithInjectedSendTime<TInput>) => Promise<TResult>
    : never;
