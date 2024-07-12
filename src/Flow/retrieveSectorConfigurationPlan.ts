import type { FlowClient } from './';
import { injectSendTime, responseStatusHandler } from '../utils/internals';
import type { SoapOptions } from '../soap';
import { prepareSerializer } from '../utils/transformers';
import { instrument } from '../utils/instrumentation';

import type {
  SectorConfigurationPlanRetrievalRequest,
  SectorConfigurationPlanRetrievalReply,
  KnownConfigurations,
  SectorConfigurationId,
} from './types';

export {
  SectorConfigurationPlanRetrievalRequest,
  SectorConfigurationPlanRetrievalReply,
} from './types';

import type { AirspaceId } from '../Airspace/types';
import type { B2BDeserializedResponse } from '..';

type Values = SectorConfigurationPlanRetrievalRequest;
type Result = SectorConfigurationPlanRetrievalReply;

export type Resolver = (
  values?: Values,
  options?: SoapOptions,
) => Promise<Result>;

export default function prepareRetrieveSectorConfigurationPlan(
  client: FlowClient,
): Resolver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const schema =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    client.describe().TacticalUpdatesService.TacticalUpdatesPort
      .retrieveSectorConfigurationPlan.input;
  const serializer = prepareSerializer(schema);

  return instrument<Values, Result>({
    service: 'Flow',
    query: 'retrieveSectorConfigurationPlan',
  })(
    (values, options) =>
      new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        client.retrieveSectorConfigurationPlan(
          serializer(injectSendTime(values)),
          options,
          responseStatusHandler(resolve, reject),
        );
      }),
  );
}

export function knownConfigurationsToMap(
  knownConfigurations: undefined | null | B2BDeserializedResponse<KnownConfigurations>,
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
