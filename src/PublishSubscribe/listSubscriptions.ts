import { PublishSubscribeClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import { SubscriptionListRequest, SubscriptionListReply } from './types';
export { SubscriptionListRequest, SubscriptionListReply } from './types';

type Values = SubscriptionListRequest;
type Result = SubscriptionListReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareListSubscriptions(
  client: PublishSubscribeClient,
): Resolver {
  const schema = client.describe().SubscriptionManagementService
    .SubscriptionManagementPort.listSubscriptions.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'PublishSubscribe',
    query: 'listSubscriptions',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.listSubscriptions(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
