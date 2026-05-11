import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type {
  CompleteAIXMDatasetReply,
  CompleteAIXMDatasetRequest,
} from './types.ts';

export const queryCompleteAIXMDatasets = createSoapQueryDefinition<
  CompleteAIXMDatasetRequest,
  CompleteAIXMDatasetReply
>({
  service: 'Airspace',
  query: 'queryCompleteAIXMDatasets',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().AirspaceStructureService.AirspaceStructurePort
      .queryCompleteAIXMDatasets.input,
});
