import type { FlightClient } from './index.js';
import {
  injectSendTime,
  responseStatusHandler,
  type InjectSendTime,
} from '../utils/internals.js';
import type { SoapOptions } from '../soap.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import { instrument } from '../utils/instrumentation/index.js';

import type {
  FlightListByTrafficVolumeRequest,
  FlightListByTrafficVolumeReply,
} from './types.js';

export type {
  FlightListByTrafficVolumeRequest,
  FlightListByTrafficVolumeReply,
} from './types.js';

type Input = InjectSendTime<FlightListByTrafficVolumeRequest>;
type Result = FlightListByTrafficVolumeReply;

export type Resolver = (
  values: Input,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightsByTrafficVolume(
  client: FlightClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByTrafficVolume.input;
  const serializer = prepareSerializer(schema);

  return instrument<Input, Result>({
    service: 'Flight',
    query: 'queryFlightsByTrafficVolume',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.queryFlightsByTrafficVolume(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
