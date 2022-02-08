export type ReroutingId = string; // (UALPHA|DIGIT|*){1,8}
export type RegulationId = string; // UALPHA(UALPHA|DIGIT){0,5}DIGIT{2}UALPHA{0,1}
export type MeasureId =
  | { REGULATION: RegulationId }
  | { REROUTING: ReroutingId }
  | { MCDM_ONLY: RegulationId };
export type FlowId = string; // TEXT{1,8}
export type ScenarioId = string;
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
  NMSet,
  NMMap,
  NMInt,
  DistanceM,
  DateTimeSecond,
  UserId,
  AirNavigationUnitId,
  DateTimeMinute,
} from '../Common/types';

import { TrafficType, FlightKeys } from '../Flight/types';

export interface FlightRegulationLocation {
  regulationId: RegulationId;
  referenceLocation: ReferenceLocation;
  toConfirm: boolean;
}

export type FlightAtfcmMeasureLocation = object;

export interface RegulationCause {
  reason: RegulationReason;
  locationCategory: RegulationLocationCategory;
  iataDelayCode: number;
}

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

export interface FlightHotspotLocation {
  hotspot: Hotspot;
  referenceLocation: ReferenceLocation;
}

export interface Hotspot {
  hotspotId: HotspotId;
  severity: HotspotSeverity;
  status: HotspotStatus;
  remark?: string;
  trafficVolumeDescription?: string;
}

export type HotspotSeverity = 'HIGH' | 'LOW' | 'MEDIUM';
export type HotspotStatus = 'ACCEPTABLE' | 'ACTIVE' | 'DRAFT' | 'SOLVED';
export interface HotspotId {
  applicabilityPeriod: DateTimeMinutePeriod;
  trafficVolume: TrafficVolumeId;
  duration: DurationHourMinute;
}

export interface FlightMCDMInfo {
  firstAssociatedMCDMMeasure: MeasureId;
  nrAssociatedMCDMRegulations: number;
  nrAssociatedMCDMReroutings: number;
  nrAssociatedMCDMOnlyMeasures: number;
  worstMCDMState: MCDMState;
}

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
export interface CountsInterval {
  duration: DurationHourMinute;
  step: DurationHourMinute;
}

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
  data: SectorConfigurationPlanRetrievalReplyData;
}

export interface SectorConfigurationPlanRetrievalReplyData {
  plan: SectorConfigurationPlan;
}

export type KnownConfigurations = NMMap<
  SectorConfigurationId,
  NMSet<AirspaceId>
>;

export interface SectorConfigurationPlan extends TacticalConfigurationPlan {
  airspace: AirspaceId;
  knownConfigurations?: NMMap<SectorConfigurationId, NMSet<AirspaceId>>;
  nmSchedule?: NMSet<PlannedSectorConfigurationActivation>; // Set<PlannedSectorConfigurationActivation>
  clientSchedule?: NMSet<PlannedSectorConfigurationActivation>; // Set<PlannedSectorConfigurationActivation>
}

export interface PlannedSectorConfigurationActivation {
  applicabilityPeriod: DateTimeMinutePeriod;
  dataSource: PlanDataSource;
  sectorConfigurationId?: SectorConfigurationId;
}

export interface TacticalConfigurationPlan {
  dataId: PlanDataId;
  dataset: Dataset;
  day: DateYearMonthDay;
  planTransferred?: boolean;
  planCutOffReached?: boolean;
}

export interface TrafficCountsByAirspaceRequest extends TrafficCountsRequest {
  airspace: AirspaceId;
  calculationType: CountsCalculationType;
}

export interface TrafficCountsByTrafficVolumeRequest
  extends TrafficCountsRequest {
  trafficVolume: TrafficVolumeId;
  calculationType: CountsCalculationType;
  computeOtmvAlerts?: boolean;
  computeFlowCounts?: FlowType;
  includeInvisibleFlights?: boolean;
}

export interface TrafficCountsRequest {
  dataset: Dataset;
  trafficWindow: DateTimeMinutePeriod;
  includeProposalFlights: boolean;
  includeForecastFlights: boolean;
  trafficTypes: NMSet<TrafficType>;
  computeSubTotals: boolean;
  countsInterval: CountsInterval;
}

export interface TrafficCountsByAirspaceReply extends Reply {
  data: TrafficCountsReplyData;
}

export interface TrafficCountsByTrafficVolumeReply extends Reply {
  data: TrafficCountsReplyData;
}

export interface TrafficCountsReplyData {
  effectiveTrafficWindow: DateTimeMinutePeriod;
  flows?: NMSet<Flow>;
  counts?: NMMap<DateTimeMinutePeriod, NMMap<TrafficType, Counts>>;
  otmvAlerts?: NMMap<TrafficType, NMSet<OtmvAlert>>;
}

export interface Flow {
  id: FlowId;
  type: FlowType;
  role?: FlowRoleSelection;
  applicableScenarios?: TrafficVolumeScenarios;
  scenarioImpact?: ScenarioImpact;
}

export type ScenarioImpact = {
  totalCommonFlights: CountsValue;
  totalOtherFlights: CountsValue;
  scenarioTrafficVolumeEntryPeriod?: DateTimeMinutePeriod;
};

export type FlowType = 'ASSOCIATED' | 'LINKED' | 'SCENARIO';
export type FlowRoleSelection =
  | 'EXCLUDED'
  | 'EXEMPTED'
  | 'INCLUDED'
  | 'INCLUDED_AND_EXEMPTED';

export interface Counts {
  totalCounts: CountsValue;
  flowCounts?: NMMap<FlowId, CountsValue>;
  subTotalsCounts?: NMMap<SubTotalsTrafficCountsType, CountsValue>;
}

export type CountsValue = number;
export type SubTotalsTrafficCountsType =
  | 'ATC_ACTIVATED'
  | 'IFPL'
  | 'PFD'
  | 'RPL'
  | 'SUSPENDED'
  | 'TACT_ACTIVATED_WITHOUT_FSA'
  | 'TACT_ACTIVATED_WITH_FSA';

export interface OtmvAlert {
  period: DateTimeMinutePeriod;
  status: OtmvStatus;
}

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

export interface RegulationListReplyData
  extends RegulationOrMCDMOnlyListReplyData {
  regulations: NMSet<Regulation>;
}

export interface RegulationOrMCDMOnlyListReplyData
  extends MeasureListReplyData {}

export interface MeasureListReplyData {
  planTransferred?: boolean;
  planCutOffReached?: boolean;
  dataset: Dataset;
}

export type RegulationOrMCDMOnlyListRequest = MeasureListRequest & {
  regulations?: NMSet<RegulationIdWildcard>;
  reasons?: NMSet<RegulationReason>;
};

export interface MeasureListRequest {
  dataset: Dataset;
  queryPeriod: DateTimeMinutePeriod;
  tvs?: NMSet<TrafficVolumeIdWildcard>;
  tvSets?: NMSet<TrafficVolumeSetIdWildcard>;
}

export interface Regulation extends RegulationOrMCDMOnly {
  regulationState: RegulationState;
}

export type TrafficVolumeScenarios = {
  solutionTrafficVolumeId: TrafficVolumeId;
  trafficVolumeMatchingKind: ScenarioTrafficVolumeMatchingKind;
  scenarios: NMSet<ScenarioId>;
};

export type ScenarioTrafficVolumeMatchingKind =
  | 'INDIRECT_OFFLOAD'
  | 'OVERLAPPING_REFERENCE_LOCATION'
  | 'SAME_REFERENCE_LOCATION'
  | 'SAME_TRAFFIC_VOLUME';

export interface RegulationOrMCDMOnly extends Measure {
  regulationId: RegulationId;
  reason?: RegulationReason;
  location?: TrafficVolumeLocation;
  protectedLocation?: ReferenceLocation;
  initialConstraints?: RegulationInitialConstraint[];
  supplementaryConstraints?: RegulationSupplementaryConstraint[];
  remark?: string;
  autolink?: boolean;
  linkedRegulations?: NMSet<RegulationId>;
  noDelayWindow?: DurationHourMinute;
  updateCapacityRequired?: boolean;
  updateTCActivationRequired?: boolean;
  delayTVSet?: TrafficVolumeSetId;
  delayConfirmationThreshold?: DurationHourMinute;
}

export interface Measure {
  dataId?: PlanDataId;
  applicability?: DateTimeMinutePeriod;
  measureCherryPicked?: boolean;
  lastUpdate?: LifeCycleEvent;
  externallyEditable?: boolean;
  subType?: MeasureSubType;
  createdByFMP?: boolean;
  mcdmRequired?: boolean;
  sourceHotspot?: HotspotId;
  scenarioReference?: MeasureFromScenarioRepository;
  mcdmInfo?: MCDMMeasureTopic;
}

export type MeasureSubType =
  | 'AIRBORNE_HORIZONTAL_REROUTING'
  | 'AIRBORNE_LEVEL_CAP'
  | 'GROUND_DELAY'
  | 'GROUND_HORIZONTAL_REROUTING'
  | 'GROUND_LEVEL_CAP'
  | 'MILES_MINUTES_IN_TRAIL'
  | 'MINIMUM_DEPARTURE_INTERVAL'
  | 'OTHER_KIND_OF_STAM_MEASURE'
  | 'TAKE_OFF_NOT_AFTER'
  | 'TAKE_OFF_NOT_BEFORE'
  | 'TERMINAL_PROCEDURE_CHANGE';

export interface MeasureFromScenarioRepository {
  scenarioId: ScenarioId;
  measureId: MeasureId;
}

export interface LifeCycleEvent {
  eventTime: DateTimeSecond;
  userUpdateEventTime?: DateTimeSecond;
  userUpdateType: LifeCycleEventType;
  userId: UserId;
}

export interface MCDMMeasureTopic extends MCDMStatefulTopic {
  userCategories?: NMSet<MCDMRoleUserCategory>;
  deadlines?: MCDMDeadlines;
  flightTopics?: NMSet<MCDMFlightTopic>;
  predefinedUsersForFlightCoordinationLevel?: NMSet<MCDMUserAndRole>;
  remark?: string;
  proposalNote?: string;
  proposalFeedback?: string;
}

export interface MCDMStatefulTopic extends MCDMTopic {
  measureId?: MeasureId;
  state?: MCDMState;
  hotspotId?: HotspotId;
  initiator?: AirNavigationUnitId;
  initiatorIsImplementer?: boolean;
  userRolesAndApprovalStates?: NMSet<MCDMUserRoleAndApprovalState>;
}

export interface MCDMTopic {
  topicId: MCDMTopicId;
  dataId?: PlanDataId;
}

export type MCDMTopicId = string;

export interface MCDMRoleUserCategory {
  category: MCDMUserCategory;
  coordinationLevel: MCDMCoordinationLevel;
  role: MCDMRole;
}

export interface MCDMDeadlines {
  timeToCoordinate?: DateTimeMinute;
  timeToStartImplement?: DateTimeMinute;
  timeToImplement?: DateTimeMinute;
}

export interface MCDMFlightTopic extends MCDMStatefulTopic {
  flightKeys: FlightKeys;
  ticket?: EhelpDeskTicketChoice;
}

export type EhelpDeskTicketChoice = unknown; // TODO: Implement this stuff

export interface MCDMUserAndRole {
  user: AirNavigationUnitId;
  role?: MCDMRole;
}

export type MCDMCoordinationLevel = 'FLIGHT' | 'MEASURE';

export type MCDMUserCategory =
  | 'ADJACENT_FMP'
  | 'AIRCRAFT_OPERATOR'
  | 'ALL_FMP'
  | 'NMOC'
  | 'TOWER';

export interface MCDMUserRoleAndApprovalState {
  user: AirNavigationUnitId;
  role?: MCDMRole;
  approvalState?: MCDMApprovalState;
}

export type MCDMRole =
  | 'APPROVAL'
  | 'IMPLEMENTER'
  | 'INFO'
  | 'INITIATOR'
  | 'NOT_INVOLVED'
  | 'ROLE_INFO';

export type MCDMApprovalState =
  | 'ACKNOWLEDGED'
  | 'APPROVED'
  | 'REJECTED'
  | 'UNKNOWN';

export type LifeCycleEventType = 'CREATION' | 'DELETION' | 'UPDATE';

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

export interface RegulationInitialConstraint {
  constraintPeriod: DateTimeMinutePeriod;
  normalRate: number;
  pendingRate: number;
  equipmentRate: number;
  exceptionalConstraint?: RegulationExceptionalConstraint;
}

export interface RegulationExceptionalConstraint {
  runwayVisualRange?: DistanceM;
  fcmMandatory: boolean;
  shift: boolean;
}

export interface RegulationSupplementaryConstraint {
  constraintPeriod: DateTimeMinutePeriod;
  supplementaryRate: number;
}

export interface HotspotListRequest {
  dataset: Dataset;
  day: DateYearMonthDay;
  trafficVolume?: TrafficVolumeId;
  duration?: DurationHourMinute;
  hotspotKind: HotspotKind;
}

export type HotspotKind = 'LOCATION_OF_INTEREST' | 'PROBLEM';

export interface HotspotListReply extends Reply {
  plans: HotspotPlans;
}

export interface HotspotPlans {
  dataId: PlanDataId;
  dataset: Dataset;
  day: DateYearMonthDay;
  planTransferred?: boolean;
  planCutOffreached?: boolean;
  hotspotKind: HotspotKind;
  schedules: NMMap<TrafficVolumeId, NMMap<DurationHourMinute, NMSet<Hotspot>>>;
}

export interface OTMVWithDuration {
  trafficVolume: TrafficVolumeId;
  otvmDuration?: DurationHourMinute;
}

export interface OTMVPlanRetrievalRequest
  extends TacticalConfigurationRetrievalRequest {
  otmvsWithDuration: NMSet<OTMVWithDuration>;
}

export interface OTMVPlans extends TacticalConfigurationPlan {
  tvsOTMVs: NMMap<
    TrafficVolumeId,
    NMMap<DurationHourMinute, OTMVPlanForDuration>
  >;
}

interface OTMVPlanForDuration {
  nmSchedule?: NMSet<PlannedOTMV>;
  clientSchedule: NMSet<PlannedOTMV>;
}

interface PlannedOTMV {
  applicabilityPeriod: DateTimeMinutePeriod;
  dataSource: PlanDataSource;
  otmv?: OTMV;
}

interface OTMV {
  trafficVolume: TrafficVolumeId;
  otmvDuration: DurationHourMinute;
  peak?: OTMVPeak;
  sustained?: OTMVSustained;
  remark?: string;
}

interface OTMVPeak {
  threshold: OTMVThreshold;
}

interface OTMVSustained {
  threshold: OTMVThreshold;
  crossingOccurences: number;
  elapsed: DurationHourMinute;
}

type OTMVThreshold = number;

export interface OTMVPlanRetrievalReply extends Reply {
  data: OTMVPlanRetrievalReplyData;
}

export interface OTMVPlanRetrievalReplyData {
  plans: OTMVPlans;
}

export interface CapacityPlanRetrievalRequest
  extends TacticalConfigurationRetrievalRequest {
  trafficVolumes: NMSet<TrafficVolumeId>;
}

export interface CapacityPlanRetrievalReply extends Reply {
  data: CapacityPlanRetrievalReplyData;
}

export interface CapacityPlanRetrievalReplyData {
  plans: CapacityPlans;
}

export interface CapacityPlans extends TacticalConfigurationPlan {
  tvCapacities: NMMap<TrafficVolumeId, PlannedCapacities>;
}

export interface PlannedCapacities {
  nmSchedule?: NMSet<PlannedCapacity>;
  clientSchedule: NMSet<PlannedCapacity>;
}

export interface PlannedCapacity {
  applicabilityPeriod: DateTimeMinutePeriod;
  dataSource: PlanDataSource;
  capacity?: Capacity;
}

export type Capacity = number;
