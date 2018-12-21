import { FlightExchangeModel } from '../Flight/types';
import { RegulationField } from '../Flow/types';
import {
  AirNavigationUnitId,
  UUID,
  NMRelease,
  Reply,
  NMSet,
  DateTimeSecond,
  Timestamp,
} from '../Common/types';

export type QueueName = string; // ANY{1,200}
export type SubscriptionTopic =
  | 'AIXM_DATASETS'
  | 'ATM_INFORMATION'
  | 'EAUP'
  | 'FLIGHT_DATA'
  | 'FLIGHT_PLANS'
  | 'REGULATIONS';

export type SubscriptionCreationRequest =
  | SubscriptionCreationRequest_FlightData
  | SubscriptionCreationRequest_FlightPlan
  | SubscriptionCreationRequest_EAUP
  | SubscriptionCreationRequest_AIXM_Datasets
  | SubscriptionCreationRequest_ATM_INFORMATION;

export interface SubscriptionCreationReply extends Reply {
  subscription: Subscription;
}

export interface SubscriptionListRequest {
  states?: NMSet<SubscriptionState>;
}

export interface SubscriptionListReply extends Reply {
  data: {
    subscriptions?: NMSet<Subscription>;
  };
}

export interface Subscription {
  uuid: UUID;
  release: NMRelease;
  anuId: AirNavigationUnitId;
  queueName: QueueName;
  topic: SubscriptionTopic;
  state: SubscriptionState;
  description?: string;
  creationDate: DateTimeSecond;
  lastUpdatedBy: string;
  lastUpdatedOn: Timestamp;
  lastUpdateReason: SubscriptionUpdateReason;
  lastUpdateComment?: string;
  messageFilter?: SubscriptionMessageFilter;
  payloadConfiguration: SubscriptionPayloadConfiguration;
}

export type SubscriptionState =
  | 'ACTIVE'
  | 'DELETED'
  | 'PAUSED'
  | 'SUSPENDED_ACTIVE'
  | 'SUSPENDED_PAUSED';

export type SubscriptionUpdateReason =
  | 'MAINTENANCE'
  | 'MSG_EXPIRED'
  | 'USER_REQUEST';

export type SubscriptionMessageFilter =
  | AIXMDatasetMessageFilter
  | FlightPlanMessageFilter
  | RegulationMessageFilter
  | FlightFilingResultMessageFilter
  | FlightDataMessageFilter;

export interface SubscriptionCreationRequest_FlightData {
  topic: 'FLIGHT_DATA';
  description?: string;
  'messageFilter-FlightDataMessageFilter': FlightDataMessageFilter;
  'payloadConfiguration-FlightDataPayloadConfiguration'?: FlightDataPayloadConfiguration;
  queueName?: QueueName;
}

export interface SubscriptionCreationRequest_FlightPlan {
  topic: 'FLIGHT_PLAN';
  description?: string;
  'messageFilter-FlightPlanMessageFilter': NMSet<FlightPlanMessageFilter>;
  'payloadConfiguration-FlightPlanPayloadConfiguration'?: FlightPlanPayloadConfiguration;
  queueName?: QueueName;
}

export interface SubscriptionCreationRequest_Regulation {
  topic: 'REGULATIONS';
  description?: string;
  'messageFilter-RegulationMessageFilter'?: NMSet<RegulationMessageFilter>;
  'payloadConfiguration-RegulationPayloadConfiguration'?: RegulationPayloadConfiguration;
  queueName?: QueueName;
}

export interface SubscriptionCreationRequest_EAUP {
  topic: 'EAUP';
  description?: string;
  'payloadConfiguration-EAUPPayloadConfiguration'?: EAUPPayloadConfiguration;
  queueName?: QueueName;
}

export interface SubscriptionCreationRequest_AIXM_Datasets {
  topic: 'AIXM_DATASETS';
  description?: string;
  'messageFilter-AIXMDatasetMessageFilter'?: NMSet<AIXMDatasetMessageFilter>;
  queueName?: QueueName;
}

export interface SubscriptionCreationRequest_ATM_INFORMATION {
  topic: 'ATM_INFORMATION';
  description?: string;
  queueName?: QueueName;
}

export interface AIXMDatasetMessageFilter {
  datasetTypes: any[];
}

export interface FlightPlanMessageFilter {
  events?: any[]; // FlightPlanEventType
  flightSet: object[]; // FlightSetDefinitionElement
}

export interface FlightDataMessageFilter {
  flightSet: NMSet<FlightSetDefinitionElement>;
}

export interface FlightFilingResultMessageFilter {
  originatorAnuId: AirNavigationUnitId;
}

export interface RegulationMessageFilter {
  tvs?: any[]; // TrafficVolumeIdWildcard
  tvSets?: any[]; // TrafficVolumeSetIdWildcard
}

export interface FlightSetDefinitionElement {
  aircraftOperators?: any[]; // AircraftOperatorIATAId
  aircraftRegistrations?: any[]; // AircraftRegistrationMark
  aerodromesOfDeparture?: any[]; // AerodromeIATAOrICAOId
  aerodromesOfArrival?: any[]; // AerodromeIATAOrICAOId
  anuIds?: any[]; // AirNavigationUnitId
  flightPlanOriginators?: any[]; // AirNavigationUnitId
}

export type SubscriptionPayloadConfiguration =
  | FlightPlanPayloadConfiguration
  | EAUPPayloadConfiguration
  | FlightDataPayloadConfiguration
  | RegulationPayloadConfiguration;

export interface FlightPlanPayloadConfiguration {
  flightPlanFormat: FlightExchangeModel;
}

export interface EAUPPayloadConfiguration {
  includeCDROpeningsClosures: boolean;
  includeRSAAllocations: boolean;
}

export interface FlightDataPayloadConfiguration {
  flightFields: PSFlightField[];
}

export interface RegulationPayloadConfiguration {
  regulationFields: RegulationField[];
}

export type PSFlightField =
  | 'actualTakeOffTime'
  | 'actualTimeOfArrival'
  | 'aircraftAddress'
  | 'aircraftOperator'
  | 'aircraftType'
  | 'calculatedTakeOffTime'
  | 'calculatedTimeOfArrival'
  | 'cdm'
  | 'confirmedCTFM'
  | 'currentlyUsedTaxiTime'
  | 'delay'
  | 'divertedAerodromeOfDestination'
  | 'estimatedTakeOffTime'
  | 'estimatedTimeOfArrival'
  | 'filedRegistrationMark'
  | 'flightDataVersionNr'
  | 'flightState'
  | 'hasOtherRegulations'
  | 'highestModelAirspaceProfile'
  | 'highestModelPointProfile'
  | 'icaoRoute'
  | 'lastKnownPosition'
  | 'mostPenalisingRegulation'
  | 'mostPenalisingRegulationCause'
  | 'operatingAircraftOperator'
  | 'readyStatus'
  | 'regulationLocations'
  | 'suspensionStatus'
  | 'targetTimeOverFix';
