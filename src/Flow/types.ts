import type {
  ReferenceLocation,
  TrafficVolumeId,
  AirspaceId,
  TrafficVolumeIdWildcard,
  TrafficVolumeSetIdWildcard,
  FlightLevelRange,
  TrafficVolumeSetId,
  AerodromeICAOId,
  WithReferenceLocationOnPrefix,
  WithReferenceLocationOnPrefixOptional,
} from '../Airspace/types.js';

import type {
  DateTimeMinutePeriod,
  DurationHourMinute,
  Dataset,
  DateYearMonthDay,
  PlanDataId,
  NMSet,
  NMMap,
  DistanceM,
  DateTimeSecond,
  UserId,
  AirNavigationUnitId,
  DateTimeMinute,
  ReplyWithData,
} from '../Common/types.js';

import type {
  TrafficType,
  FlightKeys,
  IFPLId,
  GroupReroutingIndicator,
} from '../Flight/types.js';

export type ReroutingId = string; // (UALPHA|DIGIT|SPECIAL_CHARACTER){1,8}
export type RegulationId = string; // UALPHA(UALPHA|DIGIT){0,5}DIGIT{2}UALPHA{0,1}
export type MeasureId =
  | { REGULATION: RegulationId }
  | { REROUTING: ReroutingId };
export type FlowId = string; // (UALPHA|DIGIT|SPECIAL_CHARACTER){1,8}
export type ScenarioId = string;
export type SectorConfigurationId = string; // (UALPHA|DIGIT|.){1,6}
export type PlanDataSource = 'AIRSPACE' | 'MEASURE' | 'NO_DATA' | 'TACTICAL';
export type RegulationIdWildcard = string; // (UALPHA|DIGIT){1,8}|(UALPHA|DIGIT){0,7}*

export type FlightRegulationLocation =
  WithReferenceLocationOnPrefix<'referenceLocation'> & {
    regulationId: RegulationId;
    toConfirm: boolean;
  };

export type FlightAtfcmMeasureLocationCommon =
  WithReferenceLocationOnPrefixOptional<'referenceLocation'> & {
    measureSubType: MeasureSubType;
    hotspotId?: HotspotId;
    mcdmState?: MCDMState;
  };

export type FlightAtfcmRegulationLocation = {
  FlightAtfcmRegulationLocation: FlightAtfcmMeasureLocationCommon & {
    regulationId: RegulationId;
    toConfirm: boolean;
  };
};

export type FlightAtfcmReroutingLocation = {
  FlightAtfcmReroutingLocation: FlightAtfcmMeasureLocationCommon & {
    reroutingId: ReroutingId;
    reroutingApplyKind: ReroutingApplyKind;
    groupReroutingIndicator: GroupReroutingIndicator;
    reroutingPurpose: ReroutingPurpose;
    requestText?: null | string;
    originatorLatestReroutingProposalFlight: boolean;
  };
};

export type ReroutingApplyKind =
  | 'EXECUTE'
  | 'FOR_INDICATION_WITHOUT_AUTOMATIC_PROPOSAL_FLIGHT'
  | 'FOR_INDICATION_WITH_AUTOMATIC_RRP'
  | 'FOR_INDICATION_WITH_AUTOMATIC_RRN';

export type ReroutingPurpose =
  | 'ATFCM'
  | 'FLIGHT_EFFICIENCY'
  | 'STAM'
  | 'AOLO_REROUTING'
  | 'ATC_ROUTING'
  | 'CDR_OPPORTUNITY';

export type FlightAtfcmMeasureLocation =
  | FlightAtfcmRegulationLocation
  | FlightAtfcmReroutingLocation;

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
  leastAdvancedMCDMMeasure: MeasureId;
  nrAssociatedMCDMRegulations: number;
  nrAssociatedMCDMReroutings: number;
  nrAssociatedMCDMOnlyMeasures: number;
  leastAdvancedMCDMState: MCDMState;
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
  | 'measureCherryPicked'
  | 'calculationType'
  | 'initialConstraints'
  | 'occupancyConstraints'
  | 'linkedRegulations'
  | 'location'
  | 'protectedLocation'
  | 'reason'
  | 'remark'
  | 'regulationState'
  | 'supplementaryConstraints'
  | 'lastUpdate'
  | 'noDelayWindow'
  | 'occupancyDuration'
  | 'updateCapacityRequired'
  | 'updateTVActivationRequired'
  | 'externallyEditable'
  | 'subType'
  | 'delayTVSet'
  | 'createdByFMP'
  | 'sourceHotspot'
  | 'mcdmRequired'
  | 'dataId'
  | 'scenarioReference'
  | 'delayConfirmationThreshold';

export interface SectorConfigurationPlanRetrievalRequest
  extends TacticalConfigurationRetrievalRequest {
  airspace: AirspaceId;
}

export interface TacticalConfigurationRetrievalRequest {
  dataset: Dataset;
  day: DateYearMonthDay;
}

export type SectorConfigurationPlanRetrievalReply =
  ReplyWithData<SectorConfigurationPlanRetrievalReplyData>;

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

export interface CapacityPlans extends TacticalConfigurationPlan {
  tvCapacities: NMMap<TrafficVolumeId, PlannedCapacities>;
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
  // computeSubTotals: boolean;
  subTotalComputeMode: CountSubTotalComputeMode;
  countsInterval: CountsInterval;
}

export type CountSubTotalComputeMode =
  /**
   * Do not compute flight count sub-totals.
   */
  | 'NO_SUB_TOTALS'
  /**
   * Compute flight count sub-totals by traffic type (see Counts.subTotalsCountsByTrafficType).
   */
  | 'SUB_TOTALS_BY_TRAFFIC_TYPE'
  /**
   * Compute flight count sub-totals by regulation details (see Counts.subTotalsCountsByRegulationDetails).
   */
  | 'SUB_TOTALS_BY_REGULATION_DETAILS';

export type TrafficCountsByAirspaceReply =
  ReplyWithData<TrafficCountsReplyData>;

export type TrafficCountsByTrafficVolumeReply =
  ReplyWithData<TrafficCountsReplyData>;

export interface TrafficCountsReplyData {
  effectiveTrafficWindow: DateTimeMinutePeriod;
  flows?: NMSet<Flow>;
  counts?: NMMap<DateTimeMinutePeriod, NMMap<TrafficType, Counts>>;
  otmvAlerts?: NMMap<TrafficType, NMSet<OtmvAlert>>;
  effectiveCapacities?: NMMap<DateTimeMinutePeriod, CountsValue>;
  effectiveOTMVs?: NMMap<DateTimeMinutePeriod, OTMVThresholds>;
}

export interface Flow {
  id: FlowId;
  type: FlowType;
  role?: FlowRoleSelection;
  applicableScenarios?: TrafficVolumeScenarios;
  scenarioImpact?: ScenarioImpact;
}

export type ScenarioImpact = {
  totalCommonFlightCount: CountsValue;
  totalOtherFlightCount: CountsValue;
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
  subTotalsCountsByTrafficType?: NMMap<SubTotalsTrafficCountsType, CountsValue>;
  subTotalsCountsByRegulationDetails?: NMMap<
    SubTotalsRegulationDetailedType,
    CountsValue
  >;
}

export type CountsValue = number;

export type OTMVThresholds = {
  peakThreshold?: OTMVThreshold;
  sustainedThreshold?: OTMVThreshold;
  sustainedElapsedDuration?: DurationHourMinute;
  sustainedCrossingOccurences?: number;
};

export type SubTotalsTrafficCountsType =
  /**
   * Predicted flights that are not suspended
   */
  | 'PFD'
  /**
   * Flights created from a flight plan filed to IFPS that are not suspended, nor ATC_ACTIVATED, nor TACT_ACTIVATED_WITH_FSA, nor TACT_ACTIVATED_WITHOUT_FSA.
   */
  | 'IFPL'
  /**
   * Suspended Flights. Note that suspended flights are not considered part of the TrafficType.LOAD.
   */
  | 'SUSPENDED'
  /**
   * ATC activated flights. Note that this also includes terminated flights that were ATC activated.
   */
  | 'ATC_ACTIVATED'
  /**
   * TACT activated with FSA message expected (but not yet received). Note that this also includes terminated flights that were TACT_ACTIVATED_WITH_FSA.
   */
  | 'TACT_ACTIVATED_WITH_FSA'
  /**
   * TACT activated with no FSA message expected. Note that this also includes terminated flights that were TACT_ACTIVATED_WITHOUT_FSA.
   */
  | 'TACT_ACTIVATED_WITHOUT_FSA';

export type SubTotalsRegulationDetailedType =
  /**
   * The count of not yet airborne delayed (delay > 0) flights of which most penalising regulation is the target regulation.
   */
  | 'DELAYED_FLIGHTS_NOT_YET_AIRBORNE'
  /**
   * The count of airborne delayed (delay > 0) flights of which most penalising regulation is the target regulation.
   */
  | 'DELAYED_FLIGHTS_ALREADY_AIRBORNE'
  /**
   * The count of not yet airborne zero (0) delay flights of which most penalising regulation is the target regulation or any other regulation.
   */
  | 'ZERO_DELAY_FLIGHTS_NOT_YET_AIRBORNE'
  /**
   * The count of airborne zero (0) delay flights of which most penalising regulation is the target regulation or any other regulation.
   */
  | 'ZERO_DELAY_FLIGHTS_ALREADY_AIRBORNE'
  /**
   * The count of not yet airborne flights with no most penalising regulation that are regulatable. These flights are typically in the extended periods around the regulation (or when showing the display when newly creating regulations).
   */
  | 'NOT_REGULATED_BUT_REGULATABLE_FLIGHTS'
  /**
   * The count of airborne flights with no most penalising regulation or, any exempted/excluded (airborne or not) flights with no most penalising regulation or of which most penalising regulation is the target regulation or any other regulation.
   */
  | 'NOT_REGULATED_AIRBORNE_OR_EXEMPTED_FLIGHTS'
  /**
   * The count of not yet airborne delayed (delay > 0) flights of which most penalising regulation is not the target regulation, excluding target regulation exempted flights.
   */
  | 'OTHER_MPR_DELAYED_FLIGHTS_NOT_YET_AIRBORNE'
  /**
   * The count of airborne delayed (delay > 0) flights of which most penalising regulation is not the target regulation, excluding target regulation exempted flights.
   */
  | 'OTHER_MPR_DELAYED_FLIGHTS_ALREADY_AIRBORNE';

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

export type RegulationListReply = ReplyWithData<RegulationListReplyData>;

export interface RegulationListReplyData
  extends RegulationOrMCDMOnlyListReplyData {
  regulations: NMSet<Regulation>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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

export type Regulation = RegulationOrMCDMOnly & {
  regulationState: RegulationState;
};

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
export interface IRegulationOrMCDMOnly extends Measure {
  regulationId: RegulationId;
  reason?: RegulationReason;
  location?: TrafficVolumeLocation;
  calculationType?: null | CountsCalculationType;
  initialConstraints?: RegulationInitialConstraint[];
  supplementaryConstraints?: RegulationSupplementaryConstraint[];
  occupancyConstraints?: RegulationOccupancyConstraint[];
  remark?: string;
  autolink?: boolean;
  linkedRegulations?: NMSet<RegulationId>;
  noDelayWindow?: DurationHourMinute;
  updateCapacityRequired?: boolean;
  updateTCActivationRequired?: boolean;
  delayTVSet?: TrafficVolumeSetId;
  delayConfirmationThreshold?: DurationHourMinute;
}

export type RegulationOrMCDMOnly =
  WithReferenceLocationOnPrefixOptional<'protectedLocation'> &
    IRegulationOrMCDMOnly;

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
  ifplId?: IFPLId;
  ticket?: EhelpDeskTicketChoice;
}

export type EhelpDeskTicketChoice = unknown; // TODO: Implement this stuff

export interface MCDMUserAndRole {
  user: AirNavigationUnitId;
  role?: MCDMRole;
}

export type MCDMCoordinationLevel = 'FLIGHT' | 'MEASURE';

export type MCDMUserCategory =
  | 'IMPACTED_FMP'
  | 'ALL_FMP'
  | 'TOWER'
  | 'AIRCRAFT_OPERATOR'
  | 'NMOC';

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

export type TrafficVolumeLocation =
  WithReferenceLocationOnPrefix<'referenceLocation'> & {
    id: TrafficVolumeId;
    flightLevels?: FlightLevelRange;
    description?: string;
    setIds?: NMSet<TrafficVolumeSetId>;
  };

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

export interface RegulationOccupancyConstraint {
  constraintPeriod: DateTimeMinutePeriod;
  occupancyRate: number;
  peakCapacity: number;
  pendingCapacityPercentage: number;
}

export interface HotspotListRequest {
  dataset: Dataset;
  day: DateYearMonthDay;
  trafficVolume?: TrafficVolumeId;
  duration?: DurationHourMinute;
  hotspotKind: HotspotKind;
}

export type HotspotKind = 'LOCATION_OF_INTEREST' | 'PROBLEM';

export type HotspotListReply = ReplyWithData<HotspotListReplyData>;

export type HotspotListReplyData = { plans: HotspotPlans };
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
  otmvDuration?: DurationHourMinute;
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

export interface OTMVPlanForDuration {
  nmSchedule?: NMSet<PlannedOTMV>;
  clientSchedule: NMSet<PlannedOTMV>;
}

export interface PlannedOTMV {
  applicabilityPeriod: DateTimeMinutePeriod;
  dataSource: PlanDataSource;
  otmv?: OTMV;
}

export interface OTMV {
  trafficVolume: TrafficVolumeId;
  otmvDuration: DurationHourMinute;
  peak?: OTMVPeak;
  sustained?: OTMVSustained;
  remark?: string;
}

export interface OTMVPeak {
  threshold: OTMVThreshold;
}

export interface OTMVSustained {
  threshold: OTMVThreshold;
  crossingOccurrences: number;
  elapsed: DurationHourMinute;
}

export type OTMVThreshold = number;

export type OTMVPlanRetrievalReply = ReplyWithData<OTMVPlanRetrievalReplyData>;

export interface OTMVPlanRetrievalReplyData {
  plans: OTMVPlans;
}

export interface OTMVPlanUpdateRequest {
  plans: OTMVPlans;
}

export type OTMVPlanUpdateReply = ReplyWithData<OTMVPlanUpdateReplyData>;

export interface OTMVPlanUpdateReplyData {
  plans: OTMVPlans;
}

export interface CapacityPlanRetrievalRequest
  extends TacticalConfigurationRetrievalRequest {
  trafficVolumes: NMSet<TrafficVolumeId>;
}

export type CapacityPlanRetrievalReply =
  ReplyWithData<CapacityPlanRetrievalReplyData>;

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

export interface CapacityPlanUpdateRequest {
  plans: CapacityPlans;
}

export type CapacityPlanUpdateReply =
  ReplyWithData<CapacityPlanUpdateReplyData>;

export interface CapacityPlanUpdateReplyData {
  plans: CapacityPlans;
}

export type RunwayConfigurationPlanRetrievalReply =
  ReplyWithData<RunwayConfigurationPlanRetrievalData>;

export interface RunwayConfigurationPlanRetrievalData {
  plan: RunwayConfigurationPlan;
}

export interface RunwayConfigurationPlan extends TacticalConfigurationPlan {
  knownRunwayIds?: NMSet<RunwayId>;
  nmSchedule?: NMSet<RunwayConfigurationPlanSchedule>;
  clientSchedule?: NMSet<RunwayConfigurationPlanSchedule>;
}

export type RunwayId = string; // ([0-9]{2}([A-Z]|( )){0,1})

export interface RunwayConfigurationPlanSchedule {
  applicabilityPeriod: DateTimeMinutePeriod;
  dataSource: PlanDataSource;
  runwayConfigurations?: NMSet<RunwayConfiguration>;
}

export interface RunwayConfiguration {
  runway: RunwayId;
  usage?: RunwayUsage;
  runwayUsageDataSource: PlanDataSource;
  departureTaxiTime?: DurationHourMinute;
  departureTaxiTimeDataSource: PlanDataSource;
  timeToInsertInSequence?: DurationHourMinute;
  timeToInsertInSequenceDataSource: PlanDataSource;
  timeToRemoveFromSequence?: DurationHourMinute;
  timeToRemoveFromSequenceDataSource: PlanDataSource;
  arrivalTaxiTime?: DurationHourMinute;
  arrivalTaxiTimeDataSource: PlanDataSource;
}
export interface RunwayConfigurationPlanRetrievalRequest
  extends TacticalConfigurationRetrievalRequest {
  aerodrome: AerodromeICAOId;
}
export type RunwayUsage =
  | 'DEPARTURE'
  | 'ARRIVAL'
  | 'DEPARTURE_ARRIVAL'
  | 'INACTIVE';
