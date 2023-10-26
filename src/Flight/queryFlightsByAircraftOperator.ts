import { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import type {
  FlightListByAircraftOperatorRequest,
  FlightListByAircraftOperatorReply,
} from './types';

export type {
  FlightListByAircraftOperatorRequest,
  FlightListByAircraftOperatorReply,
} from './types';

type Values = FlightListByAircraftOperatorRequest;
type Result = FlightListByAircraftOperatorReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightsByAircraftOperator(
  client: FlightClient,
): Resolver {
  // console.log(Object.keys(client));
  const schema =
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightsByAircraftOperator.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flight',
    query: 'queryFlightsByAircraftOperator',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.queryFlightsByAircraftOperator(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
