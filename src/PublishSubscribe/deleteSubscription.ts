import { PublishSubscribeClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';
import type {
  SubscriptionDeletionRequest,
  SubscriptionDeletionReply,
} from './types';

export type Values = SubscriptionDeletionRequest;
export type Result = SubscriptionDeletionReply;

export type Resolver = (
  values?: SubscriptionDeletionRequest,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareDeleteSubscription(
  client: PublishSubscribeClient,
): Resolver {
  // console.log(Object.keys(client));
  //
  const schema =
    client.describe().SubscriptionManagementService.SubscriptionManagementPort
      .deleteSubscription.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'PublishSubscribe',
    query: 'deleteSubscription',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.deleteSubscription(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
