import { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import { CapacityPlanUpdateRequest, CapacityPlanUpdateReply } from './types';

export { CapacityPlanUpdateRequest, CapacityPlanUpdateReply } from './types';

export type Values = CapacityPlanUpdateRequest;
export type Result = CapacityPlanUpdateReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareUpdateCapacityPlan(
  client: FlowClient,
): Resolver {
  const schema =
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .updateCapacityPlan.input; //console.log(JSON.stringify(schema));
  // console.log(schema.plans.tvCapacities['item[]'].value.nmSchedule);
  const serializer = prepareSerializer(schema); //console.log(serializer.toString());//console.dir(serializer, { depth: null });

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'updateCapacityPlan',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // console.log(JSON.stringify(serializer(injectSendTime(values))));

        client.updateCapacityPlan(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
