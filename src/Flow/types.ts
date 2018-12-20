/* @flow */
export type ReroutingId = string; // (UALPHA|DIGIT|*){1,8}
export type RegulationId = string; // UALPHA(UALPHA|DIGIT){0,5}DIGIT{2}UALPHA{0,1}
export type MeasureId =
  | { REGULATION: RegulationId }
  | { REROUTING: ReroutingId }
  | { MCDM_ONLY: RegulationId };
export type FlowId = string; // TEXT{1,8}
export type SectorConfigurationId = string; // (UALPHA|DIGIT|.){1,6}
export type PlanDataSource = 'AIRSPACE' | 'MEASURE' | 'NO_DATA' | 'TACTICAL';
export type RegulationIdWildcard = string; // (UALPHA|DIGIT){1,8}|(UALPHA|DIGIT){0,7}*

import {
  ReferenceLocation,
  TrafficVolumeId,
  AirspaceId,
  TrafficVolumeIdWildcard,
  TrafficVolumeSetIdWildcard,
  FlightLevelRange,
  TrafficVolumeSetId,
  ReferenceLocationAirspace,
  ReferenceLocationAerodrome,
  ReferenceLocationAerodromeSet,
  ReferenceLocationDBEPoint,
  ReferenceLocationPublishedPoint,
} from '../Airspace/types';

import {
  DateTimeMinutePeriod,
  DurationHourMinute,
  Request,
  Reply,
  Dataset,
  DateYearMonthDay,
  PlanDataId,
  BooleanString,
  NMSet,
  NMMap,
  NMInt,
  DistanceM,
} from '../Common/types';

import { TrafficType } from '../Flight/types';

export type FlightRegulationLocation = {
  regulationId: RegulationId;
  referenceLocation: ReferenceLocation;
  toConfirm: boolean;
};

export type FlightAtfcmMeasureLocation = Object;

export type RegulationCause = {
  reason: RegulationReason;
  locationCategory: RegulationLocationCategory;
  iataDelayCode: number;
};

export type RegulationLocationCategory = 'ARRIVAL' | 'DEPARTURE' | 'ENROUTE';

export type RegulationReason =
  | 'ACCIDENT_INCIDENT'
  | 'AERODROME_CAPACITY'
  | 'AERODROME_SERVICES'
  | 'AIRSPACE_MANAGEMENT'
  | 'ATC_CAPACITY'
  | 'ATC_EQUIPMENT'
  | 'ATC_INDUSTRIAL_ACTION'
  | 'ATC_ROUTINGS'
  | 'ATC_STAFFING'
  | 'ENVIRONMENTAL_ISSUES'
  | 'NON_ATC_INDUSTRIAL_ACTION'
  | 'OTHERS'
  | 'SPECIAL_EVENT'
  | 'WEATHER';

export type FlightHotspotLocation = {
  hotspot: Hotspot;
  referenceLocation: ReferenceLocation;
};

export type Hotspot = {
  hotspotId: HotspotId;
  severity: HotspotSeverity;
  status: HotspotStatus;
  remark?: string;
  trafficVolumeDescription?: string;
};

export type HotspotSeverity = 'HIGH' | 'LOW' | 'MEDIUM';
export type HotspotStatus = 'ACCEPTABLE' | 'ACTIVE' | 'DRAFT' | 'SOLVED';
export type HotspotId = {
  applicabilityPeriod: DateTimeMinutePeriod;
  trafficVolume: TrafficVolumeId;
  duration: DurationHourMinute;
};

export type FlightMCDMInfo = {
  firstAssociatedMCDMMeasure: MeasureId;
  nrAssociatedMCDMRegulations: number;
  nrAssociatedMCDMReroutings: number;
  nrAssociatedMCDMOnlyMeasures: number;
  worstMCDMState: MCDMState;
};

export type MCDMState =
  | 'ABANDONED'
  | 'COORDINATED'
  | 'DRAFT'
  | 'FINISHED'
  | 'IMPLEMENTED'
  | 'IMPLEMENTING'
  | 'INTERRUPTED'
  | 'PROPOSED';

export type OtmvStatus = 'PEAK' | 'SUSTAINED';

export type CountsCalculationType = 'ENTRY' | 'OCCUPANCY';
export type CountsInterval = {
  duration: DurationHourMinute;
  step: DurationHourMinute;
};

export type RegulationField =
  | 'applicability'
  | 'autolink'
  | 'createdByFMP'
  | 'dataId'
  | 'delayConfirmationThreshold'
  | 'delayTVSet'
  | 'externallyEditable'
  | 'initialConstraints'
  | 'lastUpdate'
  | 'linkedRegulations'
  | 'location'
  | 'mcdmRequired'
  | 'measureCherryPicked'
  | 'noDelayWindow'
  | 'protectedLocation'
  | 'reason'
  | 'regulationState'
  | 'remark'
  | 'scenarioReference'
  | 'sourceHotspot'
  | 'subType'
  | 'supplementaryConstraints'
  | 'updateCapacityRequired'
  | 'updateTVActivationRequired';

export interface SectorConfigurationPlanRetrievalRequest
  extends TacticalConfigurationRetrievalRequest {
  airspace: AirspaceId;
}

export interface TacticalConfigurationRetrievalRequest {
  dataset: Dataset;
  day: DateYearMonthDay;
}

export interface SectorConfigurationPlanRetrievalReply extends Reply {
  data: {
    plan: SectorConfigurationPlan;
  };
}

export type KnownConfigurations = NMMap<
  SectorConfigurationId,
  NMSet<AirspaceId>
>;

export type SectorConfigurationPlan = TacticalConfigurationPlan & {
  airspace: AirspaceId;
  knownConfigurations?: KnownConfigurations; // Map<SectorConfigurationId, Set<AirspaceId>>
  nmSchedule?: NMSet<PlannedSectorConfigurationActivation>; // Set<PlannedSectorConfigurationActivation>
  clientSchedule?: NMSet<PlannedSectorConfigurationActivation>; // Set<PlannedSectorConfigurationActivation>
};

export type PlannedSectorConfigurationActivation = {
  applicabilityPeriod: DateTimeMinutePeriod;
  dataSource: PlanDataSource;
  sectorConfigurationId?: SectorConfigurationId;
};

export type TacticalConfigurationPlan = {
  dataId: PlanDataId;
  dataset: Dataset;
  day: DateYearMonthDay;
  planTransferred?: BooleanString;
  planCutOffReached?: BooleanString;
};

export type TrafficCountsByAirspaceRequest = TrafficCountsRequest & {
  airspace: AirspaceId;
  calculationType: CountsCalculationType;
};

export type TrafficCountsByTrafficVolumeRequest = TrafficCountsRequest & {
  trafficVolume: TrafficVolumeId;
  calculationType: CountsCalculationType;
  computeOtmvAlerts?: boolean;
  computeFlowCounts?: FlowType;
  includeInvisibleFlights?: boolean;
};

export type TrafficCountsRequest = {
  dataset: Dataset;
  trafficWindow: DateTimeMinutePeriod;
  includeProposalFlights: boolean;
  includeForecastFlights: boolean;
  trafficTypes: NMSet<TrafficType>;
  computeSubTotals: boolean;
  countsInterval: CountsInterval;
};

export interface TrafficCountsByAirspaceReply extends Reply {
  data: TrafficCountsReplyData;
}

export interface TrafficCountsByTrafficVolumeReply extends Reply {
  data: TrafficCountsReplyData;
}

export type TrafficCountsReplyData = {
  effectiveTrafficWindow: DateTimeMinutePeriod;
  flows?: NMSet<Flow>;
  counts?: NMMap<DateTimeMinutePeriod, NMMap<TrafficType, Counts>>;
  otmvAlerts?: NMMap<TrafficType, NMSet<OtmvAlert>>;
};

export type Flow = {
  id: FlowId;
  type: FlowType;
  role: FlowRoleSelection;
};

export type FlowType = 'ASSOCIATED' | 'LINKED';
export type FlowRoleSelection =
  | 'EXCLUDED'
  | 'EXEMPTED'
  | 'INCLUDED'
  | 'INCLUDED_AND_EXEMPTED';

export type Counts = {
  totalCounts: CountsValue;
  flowCounts?: NMMap<FlowId, CountsValue>;
  subTotalCounts: NMMap<SubTotalsTrafficCountsType, CountsValue>;
};

export type CountsValue = NMInt;
export type SubTotalsTrafficCountsType =
  | 'ATC_ACTIVATED'
  | 'IFPL'
  | 'PFD'
  | 'RPL'
  | 'SUSPENDED'
  | 'TACT_ACTIVATED_WITHOUT_FSA'
  | 'TACT_ACTIVATED_WITH_FSA';

export type OtmvAlert = {
  period: DateTimeMinutePeriod;
  status: OtmvStatus;
};

export type RegulationState =
  | 'APPLIED'
  | 'APPLYING'
  | 'CANCELLED'
  | 'CANCELLING'
  | 'TERMINATED';

export type RegulationListRequest = RegulationOrMCDMOnlyListRequest & {
  requestedRegulationFields: NMSet<RegulationField>;
  regulationStates?: NMSet<RegulationState>;
};

export interface RegulationListReply extends Reply {
  data: RegulationListReplyData;
}

export type RegulationListReplyData = {
  regulations: NMSet<Regulation>;
};

export type RegulationOrMCDMOnlyListRequest = MeasureListRequest & {
  regulations?: NMSet<RegulationIdWildcard>;
  reasons?: NMSet<RegulationReason>;
};

export type MeasureListRequest = {
  dataset: Dataset;
  queryPeriod: DateTimeMinutePeriod;
  tvs?: NMSet<TrafficVolumeIdWildcard>;
  tvSets?: NMSet<TrafficVolumeSetIdWildcard>;
};

export type Regulation = RegulationOrMCDMOnly & {
  regulationState: RegulationState;
};

export type RegulationOrMCDMOnly = {
  regulationId: RegulationId;
  reason?: RegulationReason;
  location?: TrafficVolumeLocation;
  protectedLocation?: ReferenceLocation;
  initialConstraints?: Array<RegulationInitialConstraint>;
  supplementaryConstraints?: Array<RegulationSupplementaryConstraint>;
  remark?: string;
  autolink?: BooleanString;
  linkedRegulations: NMSet<RegulationId>;
  noDelayWindow?: DurationHourMinute;
  updateCapacityRequired?: BooleanString;
  updateTCActivationRequired?: BooleanString;
  delayTVSet?: TrafficVolumeSetId;
};

export type TrafficVolumeLocation_ReferenceLocation =
  | {
      'referenceLocation-ReferenceLocationAirspace': ReferenceLocationAirspace;
    }
  | {
      'referenceLocation-ReferenceLocationAerodrome': ReferenceLocationAerodrome;
    }
  | {
      'referenceLocation-ReferenceLocationAerodromeSet': ReferenceLocationAerodromeSet;
    }
  | {
      'referenceLocation-ReferenceLocationDBEPoint': ReferenceLocationDBEPoint;
    }
  | {
      'referenceLocation-ReferenceLocationPublishedPoint': ReferenceLocationPublishedPoint;
    };

export type TrafficVolumeLocation = {
  id: TrafficVolumeId;
  flightLevels?: FlightLevelRange;
  description?: string;
  setIds?: NMSet<TrafficVolumeSetId>;
} & TrafficVolumeLocation_ReferenceLocation;

export type RegulationInitialConstraint = {
  constraintPeriod: DateTimeMinutePeriod;
  normalRate: NMInt;
  pendingRate: NMInt;
  equipmentRate: NMInt;
  exceptionalConstraint?: RegulationExceptionalConstraint;
};

export type RegulationExceptionalConstraint = {
  runwayVisualRange?: DistanceM;
  fcmMandatory: BooleanString;
  shift: BooleanString;
};

export type RegulationSupplementaryConstraint = {
  constraintPeriod: DateTimeMinutePeriod;
  supplementaryRate: NMInt;
};

export type HotspotListRequest = {
  dataset: Dataset;
  day: DateYearMonthDay;
  trafficVolume?: TrafficVolumeId;
  duration?: DurationHourMinute;
  hotspotKind: HotspotKind;
};

export type HotspotKind = 'LOCATION_OF_INTEREST' | 'PROBLEM';

export interface HotspotListReply extends Reply {
  plans: HotspotPlans;
}

export type HotspotPlans = {
  dataId: PlanDataId;
  dataset: Dataset;
  day: DateYearMonthDay;
  planTransferred?: BooleanString;
  planCutOffreached?: BooleanString;
  hotspotKind: HotspotKind;
  schedules: NMMap<TrafficVolumeId, NMMap<DurationHourMinute, NMSet<Hotspot>>>;
};

export type OTMVWithDuration = {
  trafficVolume: TrafficVolumeId;
  otvmDuration?: DurationHourMinute;
};

export interface OTMVPlanRetrievalRequest
  extends TacticalConfigurationRetrievalRequest {
  otmvsWithDuration: NMSet<OTMVWithDuration>;
}

type OTMVPlans = NMMap<
  TrafficVolumeId,
  Map<DurationHourMinute, OTMVPlanForDuration>
>;

type OTMVPlanForDuration = {
  nmSchedule: NMSet<PlannedOTMV>;
  clientSchedule: NMSet<PlannedOTMV>;
};

type PlannedOTMV = {
  applicabilityPeriod: DateTimeMinutePeriod;
  dataSource: PlanDataSource;
  otmv?: OTMV;
};

type OTMV = {
  trafficVolume: TrafficVolumeId;
  otmvDuration: DurationHourMinute;
  peak?: OTMVPeak;
  sustained?: OTMVSustained;
  remark?: string;
};

type OTMVPeak = {
  threshold: OTMVThreshold;
};

type OTMVSustained = {
  threshold: OTMVThreshold;
  crossingOccurences: number;
  elapsed: DurationHourMinute;
};

type OTMVThreshold = number;

export interface OTMVPlanRetrievalReply extends Reply {
  data: {
    plans: OTMVPlans;
  };
}
