/* @flow */
import { FlightClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import { FlightPlanListRequest, FlightPlanListReply } from './types';
export { FlightPlanListRequest, FlightPlanListReply } from './types';

type Values = FlightPlanListRequest;
type Result = FlightPlanListReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryFlightPlans(
  client: FlightClient,
): Resolver {
  const schema = client.describe().FlightManagementService.FlightManagementPort
    .queryFlightPlans.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.queryFlightPlans(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
