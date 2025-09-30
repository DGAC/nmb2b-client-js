import type { FlowClient } from './index.js';
import {
  injectSendTime,
  responseStatusHandler,
  type InjectSendTime,
} from '../utils/internals.js';
import type { SoapOptions } from '../soap.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import { instrument } from '../utils/instrumentation/index.js';

import type { RegulationListRequest, RegulationListReply } from './types.js';
export type { RegulationListRequest, RegulationListReply } from './types.js';

type Input = InjectSendTime<RegulationListRequest>;
type Result = RegulationListReply;

export type Resolver = (
  values: Input,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryRegulations(client: FlowClient): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().MeasuresService.MeasuresPort.queryRegulations.input;
  const serializer = prepareSerializer(schema);

  return instrument<Input, Result>({
    service: 'Flow',
    query: 'queryRegulations',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.queryRegulations(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
