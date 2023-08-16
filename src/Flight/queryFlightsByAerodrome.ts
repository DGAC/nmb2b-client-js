import { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import type {
  FlightListByAerodromeRequest,
  FlightListByAerodromeReply,
} from './types';

export type {
  FlightListByAerodromeRequest,
  FlightListByAerodromeReply,
} from './types';

type Values = FlightListByAerodromeRequest;
type Result = FlightListByAerodromeReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightsByAerodrome(
  client: FlightClient,
): Resolver {
  // console.log(Object.keys(client));
  const schema =
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAerodrome.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flight',
    query: 'queryFlightsByAerodrome',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.queryFlightsByAerodrome(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
