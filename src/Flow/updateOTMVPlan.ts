import { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import { OTMVPlanUpdateRequest, OTMVPlanUpdateReply } from './types';

export { OTMVPlanUpdateRequest, OTMVPlanUpdateReply } from './types';

export type Values = OTMVPlanUpdateRequest;
export type Result = OTMVPlanUpdateReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareUpdateOTMVPlan(client: FlowClient): Resolver {
  const schema =
    client.describe().TacticalUpdatesService.TacticalUpdatesPort.updateOTMVPlan
      .input; //console.log(JSON.stringify(schema));
  const serializer = prepareSerializer(schema); //console.log(serializer.toString());//console.dir(serializer, { depth: null });

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'updateOTMVPlan',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        console.log(
          JSON.stringify(serializer(injectSendTime(values)), null, 2),
        );
        client.updateOTMVPlan(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
