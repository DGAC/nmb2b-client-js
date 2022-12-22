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
  /**
   * Notification about newly published AIMs (ATM Information Messages).
   *
   * The message type associated with this topic is the AIMMessage. This type of message is non-filterable and non-customizable.
   */
  | 'ATM_INFORMATION'
  /**
   * Notification about the publication of new Complete and Incremental Airspace Datasets.
   *
   * The message type associated with this topic is the AirspaceDataMessage.
   *
   * The AirspaceDataMessage is filterable but non-customizable (see AirspaceDataMessageFilter).
   */
  | 'AIRSPACE_DATA'
  /**
   * Notification about changes to ATFCM Regulations.
   *
   * The message type associated with this topic is the RegulationMessage.
   *
   * The RegulationMessage is both filterable and customizable (see RegulationMessageFilter and RegulationPayloadConfiguration).
   *
   * For this subscription topic the message customization (RegulationPayloadConfiguration) is mandatory.
   */
  | 'REGULATIONS'
  /**
   * Notification about the publication of EAUPs and EUUPs.
   *
   * The message type associated with this topic is the EAUPMessage.
   *
   * The EAUPMessage is not filterable but it is customizable (see EAUPPayloadConfiguration).
   */
  | 'EAUP'
  /**
   * Notification about changes to flight plans.
   *
   * The message type associated with this topic is the FlightPlanMessage.
   *
   * The FlightPlanMessage is filterable but non-customizable (see `FlightPlanMessageFilter`).
   *
   * For this subscription topic the message filter (FlightPlanMessageFilter) is mandatory.
   */
  | 'FLIGHT_PLANS'
  /**
   * Notification about flight updates (e.g. trajectory, times, status, etc).
   *
   * The message type associated with this topic is the FlightDataMessage.
   *
   * The FlightDataMessage is both filterable and customizable (see FlightDataMessageFilter and FlightDataPayloadConfiguration).
   *
   * For this subscription topic the message filter (FlightDataMessageFilter) is mandatory.
   */
  | 'FLIGHT_DATA'
  /**
   * Notification about automatic and manual processing of ATS messages (e.g. FPL, CHG, DLA, etc) that have been submitted to IFPS (via AFTN/SITA networks or via the equivalent B2B web services).
   *
   * The message type associated with this topic is the FlightFilingResultMessage.
   *
   * The FlightFilingResultMessage is filterable but non-customizable (see FlightFilingResultMessageFilter).
   */
  | 'FLIGHT_FILING_RESULT'
  /**
   * Notification about changes to flight plans.
   *
   * The message type associated with this topic is the FficeFlightFilingMessage.
   *
   * The FficeFlightFilingMessage is filterable but non-customizable (see FficeFlightFilingMessageFilter).
   *
   * For this subscription topic the message filter (FficeFlightFilingMessageFilter) is mandatory.
   */
  | 'FFICE_FLIGHT_FILING'
  /**
   * Notification about MCDM-specific topics (e.g. MCDMMeasureTopic, standalone or non-standalone MCDMFlightTopic).
   *
   * The message type associated with this subscription topic is the MCDMMessage.
   *
   * The MCDMMessage is filterable and customizable (see MCDMMessageFilter and MCDMPayloadConfiguration).
   */
  | 'MCDM';

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
  | 'USER_REQUEST'
  | 'MSG_EXPIRED'
  | 'MAINTENANCE'
  | 'NM_UPDATE'
  | 'QUEUE_OVERFLOW';

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
  | 'flightDataVersionNr'
  | 'bestReroutingIndicator';
