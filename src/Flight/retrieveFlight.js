/* @flow */
import type { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import type { FlightRetrievalRequest, FlightRetrievalReply } from './types';
export type { FlightRetrievalRequest, FlightRetrievalReply } from './types';

type Values = FlightRetrievalRequest;
type Result = FlightRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveFlight(client: FlightClient): Resolver {
  const schema = client.describe().FlightManagementService.FlightManagementPort
    .retrieveFlight.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.retrieveFlight(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
