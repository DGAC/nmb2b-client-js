import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  CompleteAIXMDatasetReply,
  CompleteAIXMDatasetRequest,
} from './types.js';

export const queryCompleteAIXMDatasets = createSoapQueryDefinition<
  CompleteAIXMDatasetRequest,
  CompleteAIXMDatasetReply
>({
  service: 'Airspace',
  query: 'queryCompleteAIXMDatasets',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().AirspaceStructureService.AirspaceStructurePort
      .queryCompleteAIXMDatasets.input,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  executeQuery: (client) => client.queryCompleteAIXMDatasetsAsync,
});
