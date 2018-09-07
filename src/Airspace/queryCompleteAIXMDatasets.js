/* @flow */
import type { AirspaceClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { prepareSerializer } from '../utils/transformers';
import type { SoapOptions } from '../soap';

type CompleteAIXMDatasetRequest = {
  ...Request,
  queryCriteria: CompleteDatasetQueryCriteria,
};

type Result = Reply & {
  data: {
    datasetSummaries: Array<CompleteDatasetSummary>,
  },
};

export type Resolver = (
  values?: CompleteAIXMDatasetRequest,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareQueryCompleteAIXMDatasets(
  client: AirspaceClient,
): Resolver {
  const schema = client.describe().AirspaceStructureService
    .AirspaceStructurePort.queryCompleteAIXMDatasets.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.queryCompleteAIXMDatasets(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}

import type {
  DateYearMonthDay,
  DateYearMonthDayPeriod,
  Request,
  Reply,
} from '../Common/types';

import type { AiracIdentifier, AIXMFile } from './types';

type CompleteDatasetSummary = {
  updateId: string,
  publicationDate: DateYearMonthDay,
  sourceAIRACs: [AiracIdentifier] | [AiracIdentifier, AiracIdentifier],
  files: Array<AIXMFile>,
};

type CompleteDatasetQueryCriteria =
  | {| publicationPeriod: DateYearMonthDayPeriod |}
  | {| airac: AiracIdentifier |}
  | {| date: DateYearMonthDay |};
