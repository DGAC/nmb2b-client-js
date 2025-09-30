import type { SoapOptions } from '../soap.js';
import { instrument } from '../utils/instrumentation/index.js';
import {
  injectSendTime,
  responseStatusHandler,
  type InjectSendTime,
} from '../utils/internals.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import type { AirspaceClient } from './index.js';

import type {
  CompleteAIXMDatasetReply,
  CompleteAIXMDatasetRequest,
} from './types.js';

export type {
  CompleteAIXMDatasetReply,
  CompleteAIXMDatasetRequest,
} from './types.js';

type Input = InjectSendTime<CompleteAIXMDatasetRequest>;
type Result = CompleteAIXMDatasetReply;

export type Resolver = (
  values: Input,
  options?: SoapOptions,
) => Promise<CompleteAIXMDatasetReply>;

export default function prepareQueryCompleteAIXMDatasets(
  client: AirspaceClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceStructureService.AirspaceStructurePort
      .queryCompleteAIXMDatasets.input;
  const serializer = prepareSerializer(schema);

  return instrument<Input, Result>({
    service: 'Airspace',
    query: 'queryCompleteAIXMDatasets',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.queryCompleteAIXMDatasets(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}
