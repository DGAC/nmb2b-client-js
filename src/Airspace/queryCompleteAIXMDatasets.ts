import type { SoapOptions } from '../soap.js';
import { instrument } from '../utils/instrumentation/index.js';
import { injectSendTime, responseStatusHandler } from '../utils/internals.js';
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

type Values = CompleteAIXMDatasetRequest;
type Result = CompleteAIXMDatasetReply;

export type Resolver = (
  values: CompleteAIXMDatasetRequest,
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

  return instrument<Values, Result>({
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
