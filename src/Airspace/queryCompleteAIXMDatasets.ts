import type { SoapOptions } from '../soap';
import { instrument } from '../utils/instrumentation';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import { prepareSerializer } from '../utils/transformers';
import type { AirspaceClient } from './';
import type { AiracIdentifier, AIXMFile } from './types';

import type {
  DateYearMonthDay,
  DateYearMonthDayPeriod,
  ReplyWithData,
} from '../Common/types';

export interface CompleteAIXMDatasetRequest {
  queryCriteria: CompleteDatasetQueryCriteria;
}

export type CompleteAIXMDatasetReply = ReplyWithData<{
  datasetSummaries: CompleteDatasetSummary[];
}>;

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

interface CompleteDatasetSummary {
  updateId: string;
  publicationDate: DateYearMonthDay;
  sourceAIRACs: [AiracIdentifier] | [AiracIdentifier, AiracIdentifier];
  files: AIXMFile[];
}

type CompleteDatasetQueryCriteria =
  | { publicationPeriod: DateYearMonthDayPeriod }
  | { airac: AiracIdentifier }
  | { date: DateYearMonthDay };
