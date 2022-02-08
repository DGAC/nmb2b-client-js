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

export interface SubscriptionCreationRequest {
  topic: SubscriptionTopic;
  description?: string;
  messageFilter?: SubscriptionMessageFilter;
  payloadConfiguration?: SubscriptionPayloadConfiguration;
  queueName?: QueueName;
}

export interface SubscriptionPauseRequest {
  uuid: UUID;
  heartbeatEnabled?: boolean;
}

export interface SubscriptionPauseReply extends Reply {
  data: {};
}

export interface SubscriptionResumeRequest {
  uuid: UUID;
}

export interface SubscriptionResumeReply extends Reply {
  data: {};
}

export interface SubscriptionDeletionRequest {
  uuid: UUID;
}

export interface SubscriptionDeletionReply extends Reply {
  data: {};
}

// export type SubscriptionCreationRequest =
//   | SubscriptionCreationRequest_FlightData
//   | SubscriptionCreationRequest_FlightPlan
//   | SubscriptionCreationRequest_EAUP
//   | SubscriptionCreationRequest_AIXM_Datasets
//   | SubscriptionCreationRequest_ATM_INFORMATION;

export interface SubscriptionCreationReply extends Reply {
  data: SubscriptionCreationReplyData;
}

export interface SubscriptionCreationReplyData {
  subscription: Subscription;
}

export interface SubscriptionListRequest {
  states?: NMSet<SubscriptionState>;
}

export interface SubscriptionListReply extends Reply {
  data: SubscriptionListReplyData;
}

export interface SubscriptionListReplyData {
  subscriptions?: NMSet<Subscription>;
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
  heartbeatEnabled: boolean;
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
  | 'NM_UPDATE'
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
  | 'aircraftType'
  | 'aircraftOperator'
  | 'operatingAircraftOperator'
  | 'icaoRoute'
  | 'filedRegistrationMark'
  | 'lateFiler'
  | 'lateUpdater'
  | 'estimatedTakeOffTime'
  | 'calculatedTakeOffTime'
  | 'actualTakeOffTime'
  | 'ctotLimitReason'
  | 'currentlyUsedTaxiTime'
  | 'suspensionStatus'
  | 'readyStatus'
  | 'cdm'
  | 'exemptedFromRegulations'
  | 'delay'
  | 'mostPenalisingRegulation'
  | 'mostPenalisingRegulationCause'
  | 'hasOtherRegulations'
  | 'regulationLocations'
  | 'targetTimeOverFix'
  | 'excludedRegulations'
  | 'divertedAerodromeOfDestination'
  | 'estimatedTimeOfArrival'
  | 'calculatedTimeOfArrival'
  | 'actualTimeOfArrival'
  | 'arrivalInformation'
  | 'flightState'
  | 'confirmedCTFM'
  | 'lastKnownPosition'
  | 'highestModelPointProfile'
  | 'highestModelAirspaceProfile'
  | 'aircraftAddress'
  | 'flightDataVersionNr';
