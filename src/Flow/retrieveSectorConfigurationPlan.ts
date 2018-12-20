import { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils';
import { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';

import {
  SectorConfigurationPlanRetrievalRequest,
  SectorConfigurationPlanRetrievalReply,
  KnownConfigurations,
  SectorConfigurationId,
} from './types';

export {
  SectorConfigurationPlanRetrievalRequest,
  SectorConfigurationPlanRetrievalReply,
} from './types';

import { AirspaceId } from '../Airspace/types';

type Values = SectorConfigurationPlanRetrievalRequest;
type Result = SectorConfigurationPlanRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveSectorConfigurationPlan(
  client: FlowClient,
): Resolver {
  const schema = client.describe().TacticalUpdatesService.TacticalUpdatesPort
    .retrieveSectorConfigurationPlan.input;
  const serializer = prepareSerializer(schema);

  return (values, options) =>
    new Promise((resolve, reject) => {
      client.retrieveSectorConfigurationPlan(
        serializer(injectSendTime(values)),
        options,
        responseStatusHandler(resolve, reject),
      );
    });
}

export function knownConfigurationsToMap(
  knownConfigurations: undefined | null | KnownConfigurations,
): Map<SectorConfigurationId, Array<AirspaceId>> {
  if (!knownConfigurations || !knownConfigurations.item) {
    return new Map();
  }

  const { item } = knownConfigurations;

  const map: Map<SectorConfigurationId, Array<AirspaceId>> = new Map();
  item.forEach(({ key, value: { item: value } }) => {
    map.set(key, value);
  });

  return map;
}
