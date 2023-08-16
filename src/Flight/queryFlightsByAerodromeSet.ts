import { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import type {
  FlightListByAerodromeSetRequest,
  FlightListByAerodromeSetReply,
} from './types';

export type {
  FlightListByAerodromeSetRequest,
  FlightListByAerodromeSetReply,
} from './types';

type Values = FlightListByAerodromeSetRequest;
type Result = FlightListByAerodromeSetReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightsByAerodromeSet(
  client: FlightClient,
): Resolver {
  // console.log(Object.keys(client));
  const schema =
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAerodromeSet.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flight',
    query: 'queryFlightsByAerodromeSet',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.queryFlightsByAerodromeSet(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
