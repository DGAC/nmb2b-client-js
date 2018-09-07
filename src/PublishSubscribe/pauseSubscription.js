/* @flow */
import type { PublishSubscribeClient } from "./";
import { injectSendTime, responseStatusHandler } from "../utils";
import type { SoapOptions } from "../soap";
import type { Reply } from "../Common/types";
import { prepareSerializer } from "../utils/transformers";

type Values = {|
  uuid: string
|};

type Result = Reply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions
) => Promise<Result>;

export default function preparePauseSubscription(
  client: PublishSubscribeClient
): Resolver {
  const schema = client.describe().SubscriptionManagementService
    .SubscriptionManagementPort.pauseSubscription.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.pauseSubscription(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject)
      );
    });
}
