import type { FlightClient } from './index.js';
import { injectSendTime, responseStatusHandler } from '../utils/internals.js';
import type { SoapOptions } from '../soap.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import { instrument } from '../utils/instrumentation/index.js';

import type {
  FlightListByAerodromeSetRequest,
  FlightListByAerodromeSetReply,
} from './types.js';

export type {
  FlightListByAerodromeSetRequest,
  FlightListByAerodromeSetReply,
} from './types.js';

type Values = FlightListByAerodromeSetRequest;
type Result = FlightListByAerodromeSetReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightsByAerodromeSet(
  client: FlightClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAerodromeSet.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flight',
    query: 'queryFlightsByAerodromeSet',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.queryFlightsByAerodromeSet(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
