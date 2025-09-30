import type { FlowClient } from './index.js';
import { injectSendTime, responseStatusHandler } from '../utils/internals.js';
import type { SoapOptions } from '../soap.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import { instrument } from '../utils/instrumentation/index.js';

import type { HotspotListRequest, HotspotListReply } from './types.js';
export type { HotspotListRequest, HotspotListReply } from './types.js';

type Values = HotspotListRequest;
type Result = HotspotListReply;

export type Resolver = (
  values: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryHotspots(client: FlowClient): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort.queryHotspots
      .input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'queryHotspots',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.queryHotspots(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
