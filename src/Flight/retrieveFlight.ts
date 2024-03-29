import { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import { FlightRetrievalRequest, FlightRetrievalReply } from './types';
export { FlightRetrievalRequest, FlightRetrievalReply } from './types';

type Values = FlightRetrievalRequest;
type Result = FlightRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveFlight(client: FlightClient): Resolver {
  const schema = client.describe().FlightManagementService.FlightManagementPort
    .retrieveFlight.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flight',
    query: 'retrieveFlight',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.retrieveFlight(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
