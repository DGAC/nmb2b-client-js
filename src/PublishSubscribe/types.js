/* @flow */
import type { FlightExchangeModel } from '../Flight/types';
import type { RegulationField } from '../Flow/types';
import type { NMSet } from '../Common/types';

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

export type SubscriptionCreationRequest_FlightData = {|
  topic: 'FLIGHT_DATA',
  description?: string,
  'messageFilter-FlightDataMessageFilter': FlightDataMessageFilter,
  'payloadConfiguration-FlightDataPayloadConfiguration'?: FlightDataPayloadConfiguration,
  queueName?: QueueName,
|};

export type SubscriptionCreationRequest_FlightPlan = {|
  topic: 'FLIGHT_PLAN',
  description?: string,
  'messageFilter-FlightPlanMessageFilter': NMSet<FlightPlanMessageFilter>,
  'payloadConfiguration-FlightPlanPayloadConfiguration'?: FlightPlanPayloadConfiguration,
  queueName?: QueueName,
|};

export type SubscriptionCreationRequest_Regulation = {|
  topic: 'REGULATIONS',
  description?: string,
  'messageFilter-RegulationMessageFilter'?: NMSet<RegulationMessageFilter>,
  'payloadConfiguration-RegulationPayloadConfiguration'?: RegulationPayloadConfiguration,
  queueName?: QueueName,
|};

export type SubscriptionCreationRequest_EAUP = {|
  topic: 'EAUP',
  description?: string,
  'payloadConfiguration-EAUPPayloadConfiguration'?: EAUPPayloadConfiguration,
  queueName?: QueueName,
|};

export type SubscriptionCreationRequest_AIXM_Datasets = {|
  topic: 'AIXM_DATASETS',
  description?: string,
  'messageFilter-AIXMDatasetMessageFilter'?: NMSet<AIXMDatasetMessageFilter>,
  queueName?: QueueName,
|};

export type SubscriptionCreationRequest_ATM_INFORMATION = {|
  topic: 'ATM_INFORMATION',
  description?: string,
  queueName?: QueueName,
|};

export type AIXMDatasetMessageFilter = {
  datasetTypes: Array<any>,
};

export type FlightPlanMessageFilter = {|
  events?: Array<any>, // FlightPlanEventType
  flightSet: Array<Object>, // FlightSetDefinitionElement
|};

export type FlightDataMessageFilter = {|
  flightSet: NMSet<FlightSetDefinitionElement>,
|};

export type RegulationMessageFilter = {|
  tvs?: Array<any>, // TrafficVolumeIdWildcard
  tvSets?: Array<any>, //TrafficVolumeSetIdWildcard
|};

export type FlightSetDefinitionElement = {|
  aircraftOperators?: Array<any>, // AircraftOperatorIATAId
  aircraftRegistrations?: Array<any>, // AircraftRegistrationMark
  aerodromesOfDeparture?: Array<any>, // AerodromeIATAOrICAOId
  aerodromesOfArrival?: Array<any>, // AerodromeIATAOrICAOId
  anuIds?: Array<any>, // AirNavigationUnitId
  flightPlanOriginators?: Array<any>, // AirNavigationUnitId
|};

export type SubscriptionPayloadConfiguration =
  | FlightPlanPayloadConfiguration
  | EAUPPayloadConfiguration
  | FlightDataPayloadConfiguration
  | RegulationPayloadConfiguration;

export type FlightPlanPayloadConfiguration = {
  flightPlanFormat: FlightExchangeModel,
};

export type EAUPPayloadConfiguration = {
  includeCDROpeningsClosures: boolean,
  includeRSAAllocations: boolean,
};

export type FlightDataPayloadConfiguration = {
  flightFields: Array<PSFlightField>,
};

export type RegulationPayloadConfiguration = {
  regulationFields: Array<RegulationField>,
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
