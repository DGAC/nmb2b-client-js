import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type { RegulationListRequest, RegulationListReply } from './types.js';

export const queryRegulations = createSoapQueryDefinition<
  RegulationListRequest,
  RegulationListReply
>({
  service: 'Flow',
  query: 'queryRegulations',
  getSchema: (client) =>
    // oxlint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().MeasuresService.MeasuresPort.queryRegulations.input,
});
