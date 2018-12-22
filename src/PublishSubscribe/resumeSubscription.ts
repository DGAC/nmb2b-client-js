import { PublishSubscribeClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { Reply } from '../Common/types';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

interface Values {
  uuid: string;
}

type Result = Reply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareResumeSubscription(
  client: PublishSubscribeClient,
): Resolver {
  const schema = client.describe().SubscriptionManagementService
    .SubscriptionManagementPort.resumeSubscription.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'PublishSubscribe',
    query: 'resumeSubscription',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.resumeSubscription(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
