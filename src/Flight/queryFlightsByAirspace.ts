import { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import {
  FlightListByAirspaceRequest,
  FlightListByAirspaceReply,
} from './types';

export {
  FlightListByAirspaceRequest,
  FlightListByAirspaceReply,
} from './types';

type Values = FlightListByAirspaceRequest;
type Result = FlightListByAirspaceReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightsByAirspace(
  client: FlightClient,
): Resolver {
  // console.log(Object.keys(client));
  const schema = client.describe().FlightManagementService.FlightManagementPort
    .queryFlightsByAirspace.input;
  const serializer = prepareSerializer(schema);
  return (values, options) =>
    new Promise((resolve, reject) => {
      client.queryFlightsByAirspace(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
