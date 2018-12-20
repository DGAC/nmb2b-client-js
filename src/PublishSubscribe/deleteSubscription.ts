import { PublishSubscribeClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { Reply } from '../Common/types';

type Values = {
  uuid: string;
};

type Result = Reply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareDeleteSubscription(
  client: PublishSubscribeClient,
): Resolver {
  // console.log(Object.keys(client));
  //
  const schema = client.describe().SubscriptionManagementService
    .SubscriptionManagementPort.deleteSubscription.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.deleteSubscription(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
