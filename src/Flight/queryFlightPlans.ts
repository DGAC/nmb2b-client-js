import type { FlightClient } from './index.js';
import { injectSendTime, responseStatusHandler } from '../utils/internals.js';
import type { SoapOptions } from '../soap.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import { instrument } from '../utils/instrumentation/index.js';
import type { FlightPlanListRequest, FlightPlanListReply } from './types.js';
export type { FlightPlanListRequest, FlightPlanListReply } from './types.js';

type Values = FlightPlanListRequest;
type Result = FlightPlanListReply;

export type Resolver = (
  values: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightPlans(
  client: FlightClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().FlightManagementService.FlightManagementPort
      .queryFlightPlans.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flight',
    query: 'queryFlightPlans',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.queryFlightPlans(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
