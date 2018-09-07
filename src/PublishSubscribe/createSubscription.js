/* @flow */
import type { PublishSubscribeClient } from "./";
import { injectSendTime, responseStatusHandler } from "../utils";
import type { SoapOptions } from "../soap";
import { prepareSerializer } from "../utils/transformers";

import type {
  SubscriptionCreationRequest,
  SubscriptionTopic,
  SubscriptionPayloadConfiguration,
  QueueName
} from "./types";

type Values = SubscriptionCreationRequest;
type Result = Object;

export type Resolver = (
  values?: Values,
  options?: SoapOptions
) => Promise<Result>;

export default function prepareCreateSubscription(
  client: PublishSubscribeClient
): Resolver {
  const schema = client.describe().SubscriptionManagementService
    .SubscriptionManagementPort.createSubscription.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.createSubscription(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject)
      );
    });
}
