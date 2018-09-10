/* @flow */
import type { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import type {
  FlightListByMeasureRequest,
  FlightListByMeasureReply,
} from './types';

export type {
  FlightListByMeasureRequest,
  FlightListByMeasureReply,
} from './types';

type Values = FlightListByMeasureRequest;
type Result = FlightListByMeasureReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightsByMeasure(
  client: FlightClient,
): Resolver {
  // console.log(Object.keys(client));
  const schema = client.describe().FlightManagementService.FlightManagementPort
    .queryFlightsByMeasure.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.queryFlightsByMeasure(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
