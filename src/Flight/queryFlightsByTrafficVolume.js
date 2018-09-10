/* @flow */
import type { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import type {
  FlightListByTrafficVolumeRequest,
  FlightListByTrafficVolumeReply,
} from './types';

export type {
  FlightListByTrafficVolumeRequest,
  FlightListByTrafficVolumeReply,
} from './types';

type Values = FlightListByTrafficVolumeRequest;
type Result = FlightListByTrafficVolumeReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightsByTrafficVolume(
  client: FlightClient,
): Resolver {
  // console.log(Object.keys(client));
  const schema = client.describe().FlightManagementService.FlightManagementPort
    .queryFlightsByTrafficVolume.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.queryFlightsByTrafficVolume(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
