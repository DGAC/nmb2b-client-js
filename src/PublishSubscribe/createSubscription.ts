import { PublishSubscribeClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import {
  SubscriptionCreationRequest,
  SubscriptionCreationReply,
} from './types';
export {
  SubscriptionCreationRequest,
  SubscriptionCreationReply,
} from './types';

type Values = SubscriptionCreationRequest;
type Result = SubscriptionCreationReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareCreateSubscription(
  client: PublishSubscribeClient,
): Resolver {
  const schema = client.describe().SubscriptionManagementService
    .SubscriptionManagementPort.createSubscription.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'PublishSubscribe',
    query: 'createSubscription',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.createSubscription(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
