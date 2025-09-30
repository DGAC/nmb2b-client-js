import type { SoapOptions } from '../soap.js';
import { instrument } from '../utils/instrumentation/index.js';
import {
  injectSendTime,
  responseStatusHandler,
  type InjectSendTime,
} from '../utils/internals.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import type { FlightClient } from './index.js';

import type {
  FlightListByAerodromeReply,
  FlightListByAerodromeRequest,
} from './types.js';

export type {
  FlightListByAerodromeReply,
  FlightListByAerodromeRequest,
} from './types.js';

type Input = InjectSendTime<FlightListByAerodromeRequest>;
type Result = FlightListByAerodromeReply;

export type Resolver = (
  values: Input,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightsByAerodrome(
  client: FlightClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAerodrome.input;
  const serializer = prepareSerializer(schema);

  return instrument<Input, Result>({
    service: 'Flight',
    query: 'queryFlightsByAerodrome',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.queryFlightsByAerodrome(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
