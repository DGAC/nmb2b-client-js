import { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import { RegulationListRequest, RegulationListReply } from './types';
export { RegulationListRequest, RegulationListReply } from './types';

type Values = RegulationListRequest;
type Result = RegulationListReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryRegulations(client: FlowClient): Resolver {
  const schema = client.describe().MeasuresService.MeasuresPort.queryRegulations
    .input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'queryRegulations',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.queryRegulations(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
