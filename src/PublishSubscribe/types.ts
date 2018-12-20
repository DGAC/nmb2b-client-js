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

export type SubscriptionListRequest = {
  states?: NMSet<SubscriptionState>;
};

export interface SubscriptionListReply extends Reply {
  data: {
    subscriptions?: NMSet<Subscription>;
  };
}

export type Subscription = {
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
};

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

export type SubscriptionCreationRequest_FlightData = {
  topic: 'FLIGHT_DATA';
  description?: string;
  'messageFilter-FlightDataMessageFilter': FlightDataMessageFilter;
  'payloadConfiguration-FlightDataPayloadConfiguration'?: FlightDataPayloadConfiguration;
  queueName?: QueueName;
};

export type SubscriptionCreationRequest_FlightPlan = {
  topic: 'FLIGHT_PLAN';
  description?: string;
  'messageFilter-FlightPlanMessageFilter': NMSet<FlightPlanMessageFilter>;
  'payloadConfiguration-FlightPlanPayloadConfiguration'?: FlightPlanPayloadConfiguration;
  queueName?: QueueName;
};

export type SubscriptionCreationRequest_Regulation = {
  topic: 'REGULATIONS';
  description?: string;
  'messageFilter-RegulationMessageFilter'?: NMSet<RegulationMessageFilter>;
  'payloadConfiguration-RegulationPayloadConfiguration'?: RegulationPayloadConfiguration;
  queueName?: QueueName;
};

export type SubscriptionCreationRequest_EAUP = {
  topic: 'EAUP';
  description?: string;
  'payloadConfiguration-EAUPPayloadConfiguration'?: EAUPPayloadConfiguration;
  queueName?: QueueName;
};

export type SubscriptionCreationRequest_AIXM_Datasets = {
  topic: 'AIXM_DATASETS';
  description?: string;
  'messageFilter-AIXMDatasetMessageFilter'?: NMSet<AIXMDatasetMessageFilter>;
  queueName?: QueueName;
};

export type SubscriptionCreationRequest_ATM_INFORMATION = {
  topic: 'ATM_INFORMATION';
  description?: string;
  queueName?: QueueName;
};

export type AIXMDatasetMessageFilter = {
  datasetTypes: Array<any>;
};

export type FlightPlanMessageFilter = {
  events?: Array<any>; // FlightPlanEventType
  flightSet: Array<Object>; // FlightSetDefinitionElement
};

export type FlightDataMessageFilter = {
  flightSet: NMSet<FlightSetDefinitionElement>;
};

export type FlightFilingResultMessageFilter = {
  originatorAnuId: AirNavigationUnitId;
};

export type RegulationMessageFilter = {
  tvs?: Array<any>; // TrafficVolumeIdWildcard
  tvSets?: Array<any>; //TrafficVolumeSetIdWildcard
};

export type FlightSetDefinitionElement = {
  aircraftOperators?: Array<any>; // AircraftOperatorIATAId
  aircraftRegistrations?: Array<any>; // AircraftRegistrationMark
  aerodromesOfDeparture?: Array<any>; // AerodromeIATAOrICAOId
  aerodromesOfArrival?: Array<any>; // AerodromeIATAOrICAOId
  anuIds?: Array<any>; // AirNavigationUnitId
  flightPlanOriginators?: Array<any>; // AirNavigationUnitId
};

export type SubscriptionPayloadConfiguration =
  | FlightPlanPayloadConfiguration
  | EAUPPayloadConfiguration
  | FlightDataPayloadConfiguration
  | RegulationPayloadConfiguration;

export type FlightPlanPayloadConfiguration = {
  flightPlanFormat: FlightExchangeModel;
};

export type EAUPPayloadConfiguration = {
  includeCDROpeningsClosures: boolean;
  includeRSAAllocations: boolean;
};

export type FlightDataPayloadConfiguration = {
  flightFields: Array<PSFlightField>;
};

export type RegulationPayloadConfiguration = {
  regulationFields: Array<RegulationField>;
};

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
