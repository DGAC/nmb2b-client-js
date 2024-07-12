import type { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import type {
  FlightListByAirspaceRequest,
  FlightListByAirspaceReply,
} from './types';

export type {
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAirspace.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flight',
    query: 'queryFlightsByAirspace',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.queryFlightsByAirspace(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
