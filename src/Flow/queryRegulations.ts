import { createSoapQueryDefinition } from '../utils/soap-query-definition.ts';
import type { RegulationListRequest, RegulationListReply } from './types.ts';

export const queryRegulations = createSoapQueryDefinition<
  RegulationListRequest,
  RegulationListReply
>({
  service: 'Flow',
  query: 'queryRegulations',
  getSchema: (client) =>
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    client.describe().MeasuresService.MeasuresPort.queryRegulations.input,
});
