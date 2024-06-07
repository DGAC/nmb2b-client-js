import type { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import type { OTMVPlanUpdateRequest, OTMVPlanUpdateReply } from './types';

export { OTMVPlanUpdateRequest, OTMVPlanUpdateReply } from './types';

export type Values = OTMVPlanUpdateRequest;
export type Result = OTMVPlanUpdateReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareUpdateOTMVPlan(client: FlowClient): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort.updateOTMVPlan
      .input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'updateOTMVPlan',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        console.log(
          JSON.stringify(serializer(injectSendTime(values)), null, 2),
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.updateOTMVPlan(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
