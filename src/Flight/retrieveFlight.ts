import type { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import type { FlightRetrievalRequest, FlightRetrievalReply } from './types';
export { FlightRetrievalRequest, FlightRetrievalReply } from './types';

type Values = FlightRetrievalRequest;
type Result = FlightRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveFlight(client: FlightClient): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .retrieveFlight.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flight',
    query: 'retrieveFlight',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.retrieveFlight(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
