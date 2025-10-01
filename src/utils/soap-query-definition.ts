import { createClientAsync, type Client as SoapClient } from 'soap';
import type { B2BRequest, Reply } from '../Common/types.js';
import type { SoapOptions } from '../soap.js';
import { instrument } from './instrumentation/index.js';
import {
  assertOkReply,
  injectSendTime,
  type InjectSendTime,
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
  service: string;
  query: string;
  getSchema: (client: SoapClient) => unknown;
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

export function fromSoapDefinition<
  TInput extends B2BRequest,
  TResult extends Reply,
>({
  queryDefinition,
  client,
}: {
  queryDefinition: SoapQueryDefinition<TInput, TResult>;
  client: SoapClient;
}): (input: InjectSendTime<TInput>, options?: SoapOptions) => Promise<TResult> {
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

  return instrument<InjectSendTime<TInput>, TResult>({
    service: queryDefinition.service,
    query: queryDefinition.query,
  })(async (input, options?): Promise<TResult> => {
    const withSendTime: TInput = injectSendTime(input);

    const [result] = await queryFn(serializer(withSendTime), options);

    assertOkReply(result);
    return result;
  });
}

export type ServiceDefinition = Record<string, SoapQueryDefinition<any, any>>;

type ExtractSoapQuery<T extends SoapQueryDefinition<B2BRequest, Reply>> =
  T extends SoapQueryDefinition<infer TInput, infer TResult>
    ? (input: InjectSendTime<TInput>) => Promise<TResult>
    : never;

export type SoapService<TDefinitions extends ServiceDefinition> = {
  __soapClient: SoapClient;
  config: Config;
} & {
  [TKey in keyof TDefinitions]: ExtractSoapQuery<TDefinitions[TKey]>;
};

export async function createService<TDefinitions extends ServiceDefinition>({
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
      fromSoapDefinition({ queryDefinition, client }),
    ]),
  );

  return {
    ...soapQueryFunctions,
    __soapClient: client,
    config,
  } as SoapService<TDefinitions>;
}
