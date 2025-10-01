import type { AirspaceId } from '../Airspace/types.js';
import type { SafeB2BDeserializedResponse } from '../types.js';
import { createSoapQueryDefinition } from '../utils/soap-query-definition.js';
import type {
  KnownConfigurations,
  SectorConfigurationId,
  SectorConfigurationPlanRetrievalReply,
  SectorConfigurationPlanRetrievalRequest,
} from './types.js';

export const retrieveSectorConfigurationPlan = createSoapQueryDefinition<
  SectorConfigurationPlanRetrievalRequest,
  SectorConfigurationPlanRetrievalReply
>({
  service: 'Flow',
  query: 'retrieveSectorConfigurationPlan',
  getSchema: (client) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveSectorConfigurationPlan.input,
});

export function knownConfigurationsToMap(
  knownConfigurations:
    | undefined
    | null
    | SafeB2BDeserializedResponse<KnownConfigurations>
    | KnownConfigurations,
): Map<SectorConfigurationId, AirspaceId[]> {
  if (!knownConfigurations?.item) {
    return new Map();
  }

  const { item } = knownConfigurations;

  const map: Map<SectorConfigurationId, AirspaceId[]> = new Map();
  item.forEach(({ key, value }) => {
    if (!value?.item) {
      return;
    }

    map.set(key, value.item);
  });

  return map;
}
