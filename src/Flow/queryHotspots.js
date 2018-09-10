/* @flow */
import type { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import type { HotspotListRequest, HotspotListReply } from './types';
export type { HotspotListRequest, HotspotListReply } from './types';

type Values = HotspotListRequest;
type Result = HotspotListReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryHotspots(client: FlowClient): Resolver {
  // console.log(client.describe());
  const schema = client.describe().TacticalUpdatesService.TacticalUpdatesPort
    .queryHotspots.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.queryHotspots(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
