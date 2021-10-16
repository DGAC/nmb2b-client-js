import { PublishSubscribeClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';
import type { SubscriptionPauseRequest, SubscriptionPauseReply } from './types';

export type Values = SubscriptionPauseRequest;
export type Result = SubscriptionPauseReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function preparePauseSubscription(
  client: PublishSubscribeClient,
): Resolver {
  const schema =
    client.describe().SubscriptionManagementService.SubscriptionManagementPort
      .pauseSubscription.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'PublishSubscribe',
    query: 'pauseSubscription',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.pauseSubscription(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
