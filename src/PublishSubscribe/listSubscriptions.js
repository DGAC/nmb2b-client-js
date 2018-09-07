/* @flow */
import type { PublishSubscribeClient } from "./";
import { injectSendTime, responseStatusHandler } from "../utils";
import type { SoapOptions } from "../soap";
import { prepareSerializer } from "../utils/transformers";

type Values = void | null;
type Result = Object;

export type Resolver = (
  values?: Values,
  options?: SoapOptions
) => Promise<Result>;

export default function prepareListSubscriptions(
  client: PublishSubscribeClient
): Resolver {
  const schema = client.describe().SubscriptionManagementService
    .SubscriptionManagementPort.listSubscriptions.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.listSubscriptions(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject)
      );
    });
}
