import { AirspaceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';
import { SoapOptions } from '../soap';

import {
  DateYearMonthDay,
  DateYearMonthDayPeriod,
  Request,
  Reply,
} from '../Common/types';

export interface CompleteAIXMDatasetRequest {
  queryCriteria: CompleteDatasetQueryCriteria;
}

export type CompleteAIXMDatasetReply = Reply & {
  data: {
    datasetSummaries: CompleteDatasetSummary[];
  };
};

type Values = CompleteAIXMDatasetRequest;
type Result = CompleteAIXMDatasetReply;

export type Resolver = (
  values: CompleteAIXMDatasetRequest,
  options?: SoapOptions,
) => Promise<CompleteAIXMDatasetReply>;

export default function prepareQueryCompleteAIXMDatasets(
  client: AirspaceClient,
): Resolver {
  const schema = client.describe().AirspaceStructureService
    .AirspaceStructurePort.queryCompleteAIXMDatasets.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Airspace',
    query: 'queryCompleteAIXMDatasets',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        client.queryCompleteAIXMDatasets(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}

import { AiracIdentifier, AIXMFile } from './types';

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
