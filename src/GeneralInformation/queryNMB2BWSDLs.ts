/* @flow */
import { GeneralInformationServiceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

type Values = any;
type Result = any;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryNMB2BWSDLs(
  client: GeneralInformationServiceClient,
): Resolver {
  // console.log(client.describe());
  const schema = client.describe().NMB2BInfoService.NMB2BInfoPort
    .queryNMB2BWSDLs.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.queryNMB2BWSDLs(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}
