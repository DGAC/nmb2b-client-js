import type { FlowClient } from './index.js';
import {
  injectSendTime,
  responseStatusHandler,
  type InjectSendTime,
} from '../utils/internals.js';
import type { SoapOptions } from '../soap.js';
import { prepareSerializer } from '../utils/transformers/index.js';
import { instrument } from '../utils/instrumentation/index.js';

import type {
  SectorConfigurationPlanRetrievalRequest,
  SectorConfigurationPlanRetrievalReply,
  KnownConfigurations,
  SectorConfigurationId,
} from './types.js';

import type { AirspaceId } from '../Airspace/types.js';
import type { SafeB2BDeserializedResponse } from '../types.js';

export type {
  SectorConfigurationPlanRetrievalRequest,
  SectorConfigurationPlanRetrievalReply,
} from './types.js';

type Input = InjectSendTime<SectorConfigurationPlanRetrievalRequest>;
type Result = SectorConfigurationPlanRetrievalReply;

export type Resolver = (
  values: Input,
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

  return instrument<Input, Result>({
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
