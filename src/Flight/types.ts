export type IFPLId = string; // UALPHA{2}DIGIT{8}
export type FlightDataset = 'flight' | 'flightPlan';
export type FlightIdentificationInput = { id: IFPLId } | { keys: FlightKeys };
export interface FlightIdentificationOutput {
  id?: IFPLId;
  keys?: FlightKeys;
}
export type AircraftICAOId = string; // (ALPHA|DIGIT){2,7}
export type ExtendedAircraftICAOId = string; // (ALPHA|DIGIT|$|#){2,7}
export type AircraftRegistrationMark = string; // (ALPHA|DIGIT|'|+|=|?|.|/|:| ){1,50}
export type ICAOAircraftAddress = string; // HEXA{6}
export type SSRCode = string; // DIGIT{4}
export type SSRMode = 'A'; // Mode A only
export type AircraftTypeICAOId = string; // ALPHA{1}(ALPHA|DIGIT){1,3}
export type OtherAircraftTypeDesignation_DataType = string; // ANY{1,60}
export type AircraftOperatorICAOId = string; // ALPHA{3}
export type AircraftIATAId = string; // (UALPHA|DIGIT){2}(UALPHA|DIGIT|*){0,1}DIGIT{3,4}UALPHA{0,1}

export type FlightTrend = 'CLIMB' | 'CRUISE' | 'DESCENT' | 'NONE';
export type FlightState =
  | 'ATC_ACTIVATED'
  | 'CANCELLED'
  | 'FILED'
  | 'FILED_SLOT_ALLOCATED'
  | 'FILED_SLOT_ISSUED'
  | 'PLANNED'
  | 'PLANNED_REROUTED'
  | 'PLANNED_SLOT_ALLOCATED'
  | 'PLANNED_SLOT_ALLOCATED_REROUTED'
  | 'TACT_ACTIVATED'
  | 'TERMINATED';
export type ATFMMessageType =
  | 'DES'
  | 'ERR'
  | 'FCM'
  | 'FLS'
  | 'FUM'
  | 'REA'
  | 'RFI'
  | 'RJT'
  | 'RRN'
  | 'RRP'
  | 'SAM'
  | 'SIP'
  | 'SLC'
  | 'SMM'
  | 'SPA'
  | 'SJR'
  | 'SRM'
  | 'SWM'
  | 'UNK';

import {
  AerodromeICAOId,
  FlightLevel,
  TerminalProcedure,
  AirSpeed,
  NetworkAddress,
  FlightPlanProcessing,
  RestrictionId,
  LoadState,
  AerodromeIATAId,
  RouteOrTerminalProcedure,
  ICAOPoint,
  AirspaceId,
  AirspaceType,
  TrafficVolumeId,
} from '../Airspace/types';

import {
  DateTimeMinute,
  DurationHourMinute,
  DurationMinute,
  DurationHourMinuteSecond,
  DateTimeSecond,
  ShiftHourMinute,
  ReceivedOrSent,
  DistanceM,
  DistanceNM,
  AirNavigationUnitId,
  TimeHourMinutePeriod,
  DateTimeMinutePeriod,
  Dataset,
  Reply,
  BooleanString,
} from '../Common/types';

import {
  RegulationId,
  FlightRegulationLocation,
  FlightAtfcmMeasureLocation,
  RegulationCause,
  FlightHotspotLocation,
  FlightMCDMInfo,
  OtmvStatus,
  CountsInterval,
  CountsCalculationType,
  FlowId,
  MeasureId,
} from '../Flow/types';

export interface FlightKeys {
  aircraftId: ExtendedAircraftICAOId;
  aerodromeOfDeparture?: AerodromeICAOId;
  nonICAOAerodromeOfDeparture?: boolean;
  airFiled: boolean;
  aerodromeOfDestination?: AerodromeICAOId;
  nonICAOAerodromeOfDestination?: boolean;
  estimatedOffBlockTime: DateTimeMinute;
}

export interface TimeAndModel {
  model: TrafficType;
  time: DateTimeMinute;
}

export type TrafficType = 'DEMAND' | 'LOAD' | 'REGULATED_DEMAND';

export type FlightField = string;

export type FlightExchangeModel = 'FIXM' | 'NM_B2B';

export type FlightPlanOutput =
  | { structured: StructuredFlightPlan }
  | { fixm: FIXMFlight };

export interface BasicTrajectoryData {
  takeOffWeight?: unknown;
  topOfClimb?: Array<unknown>;
  topOfDescent?: Array<unknown>;
  bottomOfClimb?: Array<unknown>;
  bottomOfDescent?: Array<unknown>;
  distanceAtLocationInfo: unknown;
}

export interface DepartureData {
  taxiTime: DurationMinute;
}

export type FIXMFlight = object; // aero.fixm.flight._4.FlightType
export interface StructuredFlightPlan {
  flightPlan?: FlightPlan;
  basicTrajectoryData?: BasicTrajectoryData;
  departureData?: DepartureData;
}

export type FlightPlanHistory = object;
export interface Flight {
  flightId: FlightIdentificationOutput;
  divertedAerodromeOfDestination?: AerodromeICAOId;
  aircraftType?: AircraftTypeICAOId;
  readyEstimatedOffBlockTime?: DateTimeMinute;
  cdmEstimatedOffBlockTime?: DateTimeMinute;
  revisionTimes?: {
    timeToInsertInSequence?: DurationHourMinute;
    timeToRemoveFromSequence?: DurationHourMinute;
  };
  estimatedTakeOffTime?: DateTimeMinute;
  calculatedTakeOffTime?: DateTimeMinute;
  actualTakeOffTime?: DateTimeMinute;
  ctotShiftAlreadyAppliedByTower?: ShiftHourMinute;
  requestedFlightLevel?: FlightLevel;
  taxiTime?: DurationHourMinute;
  currentlyUsedTaxiTime?: DurationHourMinuteSecond;
  estimatedTimeOfArrival?: DateTimeMinute;
  calculatedTimeOfArrival?: DateTimeMinute;
  actualTimeOfArrival?: DateTimeMinute;
  lateFilter?: BooleanString;
  lateUpdater?: BooleanString;
  suspensionStatus?: SuspensionStatus;
  suspensionResponseBy?: DateTimeMinute;
  famStatus?: FAMStatus;
  readyStatus?: ReadyStatus;
  aircraftOperator?: AircraftOperatorICAOId;
  operatingAircraftOperator?: AircraftOperatorICAOId;
  reroutingIndicator?: ReroutingIndicator;
  newRouteMinShiftDelayImprovement?: DurationHourMinute;
  reroutable?: 'CANNOT_BE_REROUTED' | 'TRY_ALLOWED' | 'TRY_AND_APPLY_ALLOWED';
  reroutingOpportunitiesExist?: BooleanString;
  cdm: CDM;
  slotIssued?: BooleanString;
  // slotImprovementProposal: SlotImprovementProposal,
  timeAtReferenceLocationEntry?: TimeAndModel;
  timeAdReferenceLocationExit?: TimeAndModel;
  flightLevelAtReferenceLocationEntry?: FlightLevel;
  flightLevelAtReferenceLocationExit?: FlightLevel;
  trendAtReferenceLocationEntry?: FlightTrend;
  trendAtReferenceLocationExit?: FlightTrend;
  trendAtReferenceLocationMiddle?: FlightTrend;
  exemptedFromRegulations?: BooleanString;
  delay?: DurationHourMinute;
  delayCharacteristics?: 'ADJUSTED_TO_CLOCK' | 'EXCEEDS_DELAY_CONFIRMATION';
  mostPenalisingRegulation?: RegulationId;
  hasOtherRegulations?: BooleanString;
  regulationLocations?: FlightRegulationLocation[];
  atfcmMeasureLocations?: FlightAtfcmMeasureLocation[];
  lastATFMMessageType?: ATFMMessageType;
  lastATFMMessageReceivedOrSent?: ReceivedOrSent;
  runwayVisualRange?: DistanceM;
  confirmedCTFM?: DistanceNM;
  exclusionFromRegulations?: ExclusionFromRegulations;
  requestedInitialFlightLevel?: FlightLevel;
  requestedInitialSpeed?: AirSpeed;
  estimatedElapsedTime?: DurationHourMinute;
  filingRule?:
    | 'FILING_ALLOWED_BY_AO_CFMU'
    | 'NOT_AUTHORISED'
    | 'OPERATOR_MUST_REFILE';
  initialFPLMessageOritinator?: MessageOriginator;
  lastFPLMessageOriginator?: MessageOriginator;
  icaoRoute?: string;
  routeLength?: DistanceNM;
  reroutingReference?: ReroutingReference;
  defaultReroutingRequestedFlightLevel?: FlightLevel;
  defaultReroutingRequestedSpeed?: AirSpeed;
  departureTolerance?: DepartureTolerance;
  mostPenalisingRegulationCause?: RegulationCause;
  lastATFMMessageOriginator?: MessageOriginator;
  ftfmPointProfile?: FlightPoint[];
  rtfmPointProfile?: FlightPoint[];
  ctfmPointProfile?: FlightPoint[];
  ftfmAirspaceProfile?: FlightAirspace[];
  rtfmAirspaceProfile?: FlightAirspace[];
  ctfmAirspaceProfile?: FlightAirspace[];
  ftfmRequestedFlightLevels?: RequestedFlightLevel[];
  rtfmRequestedFlightLevels?: RequestedFlightLevel[];
  ctfmRequestedFlightLevels?: RequestedFlightLevel[];
  flightHistory?: FlightEvent[];
  operationalLog?: FlightOperationalLogEntry[];
  equipmentCapabilityAndStatus?: EquipmentCapabilityAndStatus;
  ftfmRestrictionProfile?: FlightRestriction[];
  rtfmRestrictionProfile?: FlightRestriction[];
  ctfmRestrictionProfile?: FlightRestriction[];
  cmfuFlightType?: CfmuFlightType;
  ccamsSSRCode?: SSRCode;
  filedRegistrationMark?: AircraftRegistrationMark;
  isProposalFlight?: BooleanString;
  proposalExists?: BooleanString;
  hasBeenForced?: BooleanString;
  caughtInHotspots?: number;
  hotspots?: FlightHotspotLocation[];
  mcdmInfo?: FlightMCDMInfo;
  worstLoadStateAtReferenceLocation?: LoadStateAtReferenceLocation;
  compareWithOtherTrafficType?: DeltaEntry;
  ctotLimitReason?: CTOTLimitReason;
  profileValidity?: ProfileValidity;
  targetTimeOverFix?: TargetTime;
  flightState?: FlightState;
  lastKnownPosition?: FourDPosition;
  slotSwapCounter: {
    // SlotSwapCounter,
    currentCounter: number;
    maxLimit: number;
  };
  slotSwapCandidateList?: Array<{
    // SlotSwapCandidate,
    ifplId: IFPLId;
    subjectDeltaDelayMinutes: number;
    cadidateDeltaDelayMinutes: number;
    swapDecideByTime: DateTimeMinute;
  }>;
  aircraftAddress?: ICAOAircraftAddress;
  arrivalInformation?: unknown;
  slotZone?: {
    // SlotZone,
    beforeCTO: DurationMinute;
    afterCTO: DurationMinute;
  };
  flightDataVersionNr?: number; // FlightDataVersionNumber
}

export type MessageOriginator =
  | { airNavigationUnitId: AirNavigationUnitId }
  | { address: NetworkAddress };

export type SuspensionStatus =
  | 'AIRPORT_SUSPENSION'
  | 'DELAY_CONFIRMATION'
  | 'FLIGHT_PLAN_REVALIDATION'
  | 'MANUAL_SUSPENSION'
  | 'NOT_REPORTED_AS_AIRBORNE'
  | 'NOT_SUSPENDED'
  | 'REGULATION_CONFIRMATION'
  | 'SIT_TIME_OUT'
  | 'SLOT_MISSED'
  | 'TRAFFIC_VOLUMES_CONDITION';

export type FAMStatus =
  | 'AIRBORNE_WHEN_SHIFTED_BY_FAM'
  | 'AIRBORNE_WHEN_SUSPENDED_BY_FAM'
  | 'NOT_UNDER_FAM'
  | 'SHIFTED_BY_FAM'
  | 'SUBJECT_TO_FAM'
  | 'SUSPENDED_BY_FAM'
  | 'WAS_SHIFTED_BY_FAM'
  | 'WAS_SUBJECT_TO_FAM'
  | 'WAS_SUSPENDED_BY_FAM';

export interface ReadyStatus {
  readyForImprovement?: BooleanString;
  readyToDepart: BooleanString;
  revisedTaxiTime?: DurationHourMinute;
}

export interface ReroutingIndicator {
  rerouted: BooleanString;
  reason?: ReroutingReason;
  state?: ReroutingState;
}

export type ReroutingReason = 'AO' | 'ATFM' | 'AUTO' | 'CEU';
export type ReroutingState =
  | 'EXECUTED'
  | 'NO_MATCH'
  | 'PRODUCED'
  | 'REJECTED'
  | 'REVOKED'
  | 'TIMED_OUT';

export type OtherAerodromeDesignation =
  | {
      aerodromeName?: unknown;
      aerodromeLocation?: unknown;
    }
  | { firstLastRoutePoint: unknown };

export type Aerodrome =
  | {
      icaoId: AerodromeICAOId;
    }
  | { otherDesignation: OtherAerodromeDesignation };

export interface AirFiledData {
  atsUnitId?: unknown;
  startingPoint: unknown;
  clearedLevel: unknown;
  estimatedTimeOver: DateTimeSecond;
}

export interface AlternateAerodrome {
  icaoId: AerodromeICAOId;
  nameLocationDescription: string;
}

export interface AerodromesOfDestination {
  aerodromeOfDestination: Aerodrome;
  alternate1?: AlternateAerodrome;
  alternate2?: AlternateAerodrome;
}

export type AlternateAerodrome_DataType = string; // ANY{1, 100}

export interface SSRInfo {
  code: SSRCode;
  mode: SSRMode;
}
export interface AircraftIdentification {
  aircraftId?: AircraftICAOId;
  registrationMark: AircraftRegistrationMark;
  aircraftAddress?: ICAOAircraftAddress;
  ssrInfo?: SSRInfo;
}

export type AircraftType =
  | AircraftTypeICAOId
  | OtherAircraftTypeDesignation_DataType;

export interface FlightPlan {
  ifplId?: IFPLId;
  airFiledData?: AirFiledData;
  aerodromeOfDeparture?: Aerodrome;
  aerodromesOfDestination?: AerodromesOfDestination;
  enrouteAlternateAerodromes?: AlternateAerodrome_DataType;
  takeOffAlternateAerodromes?: AlternateAerodrome_DataType;
  aircraftId?: AircraftIdentification;
  whatIfRerouteReference?: number;
  numberOfAicraft?: number;
  aircraftType: AircraftType;
  totalEstimatedElapsedTime?: DurationHourMinute;
  eetsToLocations?: object[];
  wakeTubulenceCategory?: unknown;
  flightType?: unknown;
  flightRules?: unknown;
  estimatedOffBlockTime: DateTimeMinute;
  icaoRoute: string;
  stayInformation?: Array<unknown>;
  enrouteDelays?: Array<unknown>;
  equipmentCapabilityAndStatus?: EquipmentCapabilityAndStatus;
  surveillanceEquipment?: unknown;
  otherInformation?: unknown;
  supplementaryInformation?: unknown;
}

export interface CDM {
  status:
    | 'ACTUAL_OFFBLOCK'
    | 'DEPARTING_FROM_CDM_AIRPORT'
    | 'DEPARTING_FROM_STANDARD_AIRPORT'
    | 'ESTIMATED'
    | 'PRE_SEQUENCED'
    | 'TARGETED';
  AirportType: 'ADVANCED_ATC_TWR' | 'CDM' | 'STANDARD';
  provisionalInfo?: CDMProvisionalInfo;
  info?: CDMInfo;
}

export interface CDMProvisionalInfo {
  timestamp?: DateTimeMinute;
  aoTargetTakeOffTime?: DateTimeMinute;
  taxiTime?: DurationHourMinuteSecond;
  departureProc?: TerminalProcedure;
  aircraftType?: AircraftType;
  registrationMark?: AircraftRegistrationMark;
  departureStatus: DepartureStatus;
  mostPenalisingRegulation?: RegulationId;
  possibleCFMUTakeOffTime?: DateTimeMinute;
  suspensionStatus: SuspensionStatus;
}

export interface CDMInfo {
  earlyTargetTakeOffTime?: DateTimeMinute;
  aoTargetTakeOffTime?: DateTimeMinute;
  atcTargetTakeOffTime?: DateTimeMinute;
  sequencedTargetTakeOffTime?: DateTimeMinute;
  taxiTime?: DurationHourMinuteSecond;
  offBlockTimeDiscrepancy: BooleanString;
  departureProc?: TerminalProcedure;
  aircraftTypeDiscrepancy: BooleanString;
  aircraftType?: AircraftType;
  registrationMark?: AircraftRegistrationMark;
  registrationMarkDiscrepancy: BooleanString;
  noSlotBefore?: DurationHourMinute;
  departureStatus: DepartureStatus;
  targetOffBlockTime?: DateTimeMinute;
  targetStartupApprovalTime?: DateTimeMinute;
  cancelReason?:
    | 'FLIGHT_CANCEL_IN_AODB'
    | 'FLIGHT_PLAN_INVALID'
    | 'NO_AIRPORT_SLOT'
    | 'OTHER'
    | 'RETURN_TO_STAND'
    | 'TOBT_UNKNOWN_OR_EXPIRED'
    | 'TOT_UNKNOWN'
    | 'TSAT_EXPIRED'
    | 'UNDEFINED';
}

export type DepartureStatus = 'OK' | 'DEICING';

export interface ExclusionFromRegulations {
  onTrafficVolume?: BooleanString;
  count?: number;
  all?: BooleanString;
  hasBeenExclused: BooleanString;
}

export interface ReroutingReference {
  name?: string; // ANY{1,14}
  validTo?: DateTimeMinute;
}

export interface DepartureTolerance {
  toleranceWindow: TimeHourMinutePeriod;
  extended: BooleanString;
}

export interface FlightPoint {
  timeOver: DateTimeSecond;
  flightLevel: FlightLevel;
  entryTrend: FlightTrend;
  exitTrend: FlightTrend;
  associatedRouteOrTerminalProcedure?: RouteOrTerminalProcedure;
  coveredDistance: DistanceNM;
  isVisible: BooleanString;
  aerodrome?: AerodromeICAOId;
  point?: ICAOPoint;
  flightPlanPoint?: BooleanString;
}

export interface FlightAirspace {
  airspaceId: AirspaceId;
  airspaceType: AirspaceType;
  firstEntryTime: DateTimeSecond;
  firstEntrlyFlightLevel: FlightLevel;
  lastExitFlightLevel: FlightLevel;
  firstEntryTrend: FlightTrend;
  middleTrend: FlightTrend;
  firstEntryDistance: DistanceNM;
  lastExitTime: DateTimeSecond;
  lastExitTrend: FlightTrend;
  lastExitDistance: DistanceNM;
  occupancyDuration: DurationHourMinuteSecond;
  occupancyDistance: DistanceNM;
  activated: BooleanString;
}

export interface RequestedFlightLevel {
  flightLevel: FlightLevel;
  segmentSequenceNumber: number;
  relativeDistance: number;
}

export interface FlightEvent {
  timestamp: DateTimeSecond;
  type: FlightEventType;
  resultingState: FlightState;
  resultingOffBlockTime: DateTimeMinute;
  efdSent: BooleanString;
  fumSent: BooleanString;
}

export type FlightEventType = string; // TODO: disjoint union, too many to list !

export interface FlightOperationalLogEntry {
  timestamp?: DateTimeSecond;
  type?: FlightOperationalLogEntryType;
  etfmsId?: number;
  ifplId?: IFPLId;
  issuer?: string;
  message?: string;
  summaryFields?: string[];
}

export type FlightOperationalLogEntryType =
  | 'ENVIRONMENT_MESSSAGE'
  | 'ERRONEOUS_INCOMING_MESSAGE'
  | 'ERROR_MESSAGE'
  | 'HISTORY'
  | 'INCOMING_MESSAGE'
  | 'OUTGOING_MESSAGE'
  | 'PROCESS_ERROR'
  | 'TEXT_MESSAGE'
  | 'UNDEFINED'
  | 'USER_COMMAND'
  | 'VIOLATION'
  | 'WARNING';

export interface EquipmentCapabilityAndStatus {
  gbas?: EquipmentStatus;
  lvp?: EquipmentStatus;
  loranC?: EquipmentStatus;
  dme?: EquipmentStatus;
  fmcWprAcars?: EquipmentStatus;
  dFisAcars?: EquipmentStatus;
  pdcAcars?: EquipmentStatus;
  adf?: EquipmentStatus;
  gnss?: EquipmentStatus;
  hfRtf?: EquipmentStatus;
  inertialNavigation?: EquipmentStatus;
  cpdlcAtnVdlMode2?: EquipmentStatus;
  cpdlcFans1AHFDL?: EquipmentStatus;
  cpdlcFans1AVdlModeA?: EquipmentStatus;
  cpdlcFans1AVdlMode2?: EquipmentStatus;
  cpdlcFans1ASatcomInmarsat?: EquipmentStatus;
  cpdlcFans1ASatcomMtsat?: EquipmentStatus;
  cpdlcFans1ASatcomIridium?: EquipmentStatus;
  mls?: EquipmentStatus;
  ils?: EquipmentStatus;
  atcRtfSatcomInmarsat?: EquipmentStatus;
  atcRtfSatcomMtsat?: EquipmentStatus;
  atcRtfSatcomIridium?: EquipmentStatus;
  vor?: EquipmentStatus;
  rcp1?: EquipmentStatus;
  rcp2?: EquipmentStatus;
  rcp3?: EquipmentStatus;
  rcp4?: EquipmentStatus;
  rcp5?: EquipmentStatus;
  rcp6?: EquipmentStatus;
  rcp7?: EquipmentStatus;
  rcp8?: EquipmentStatus;
  rcp9?: EquipmentStatus;
  pbnApproved?: EquipmentStatus;
  standard?: EquipmentStatus;
  tacan?: EquipmentStatus;
  uhfRtf?: EquipmentStatus;
  vhfRtf?: EquipmentStatus;
  rvsm?: EquipmentStatus;
  mnps?: EquipmentStatus;
  khz833?: EquipmentStatus;
  other?: EquipmentStatus;
}

export type EquipmentStatus = 'EQUIPPED' | 'NOT_EQUIPPED';

export interface FlightRestriction {
  timeOver: DateTimeSecond;
  coveredDistance: DistanceNM;
  flightPlanProcessing: FlightPlanProcessing;
  restrictionId: RestrictionId;
  event: EntryExit;
  position: Position;
  flightLevel: FlightLevel;
}

export type EntryExit = 'ENTRY' | 'EXIT';
export type CfmuFlightType =
  | 'ACT'
  | 'IFPL'
  | 'MFD'
  | 'PREDICTED_FLIGHT'
  | 'RPL'
  | 'TACT_ACTIVATED'
  | 'TERMINATED';

export type LoadStateAtReferenceLocation =
  | { ENTRY: LoadState }
  | { OCCUPANCY: OtmvStatus };

export interface DeltaEntry {
  intruderKind: IntruderKind;
  originOfIntruder?: AirspaceId;
  deltaMinutes: number;
  deltaFlightLevel: number;
  deltaPosition: DistanceNM;
}

export type IntruderKind =
  | 'HORIZONTAL_INTRUDER'
  | 'unknown_INTRUDER'
  | 'NON_INTRUDER'
  | 'VERTICAL_INTRUDER';

export type CTOTLimitReason =
  | 'FORCED_BY_CHAMAN'
  | 'FORCED_BY_NMOC'
  | 'FORCED_BY_STAM_MEASURE'
  | 'FORCED_BY_TOWER'
  | 'LIMITED_BY_VIOLATION'
  | 'LIMITED_BY_VIOLATION_THEN_ZERO_RATE_OR_RVR'
  | 'SLOT_EXTENSION';

export interface ProfileValidity {
  profileValidityKind: ProfileValidityKind;
  lastValidEOBT: DateTimeMinute;
}
export type ProfileValidityKind = 'NO_VIOLATIONS' | 'UNKNOWN' | 'VIOLATIONS';

export interface TargetTime {
  regulationId: RegulationId;
  targetTime: DateTimeSecond;
  targetLevel: FlightLevel;
  aerodromeICAOId?: AerodromeICAOId;
  point?: ICAOPoint;
  flightPlanPoint?: BooleanString;
  coveredDistance: DistanceNM;
  actualTimeAtTarget?: ActualTimeAtTarget;
}

export interface FourDPosition {
  timeOver: DateTimeSecond;
  position: Position;
  level: FlightLevel;
}

export interface ActualTimeAtTarget {
  estimatedActualTimeAtTarget: DateTimeSecond;
  targetTimeCompliance: IntervalPosition;
}
export type IntervalPosition = 'AFTER' | 'BEFORE' | 'INSIDE';

export interface FlightListRequest {
  dataset: Dataset;
  includeProposalFlights: boolean;
  includeForecastFlights: boolean;
  trafficType: TrafficType;
  trafficWindow?: DateTimeMinutePeriod;
  worstLoadStateAtReferenceLocationType?: CountsCalculationType;
  compareWithOtherTrafficType?: TrafficType;
  requestedFlightFields?: FlightField[];
}

export interface FlightListByLocationRequest extends FlightListRequest {
  countsInterval?: CountsInterval;
  aircraftOperators?: AircraftOperatorICAOId[];
  includeInvisibleFlights?: boolean;
}

export interface FlightListByAirspaceRequest extends FlightListRequest {
  calculationType?: CountsCalculationType;
  airspace: AirspaceId;
}

export type FlightOrFlightPlan =
  | { flight: Flight }
  | { flightPlan: FlightPlanOrInvalidFiling };

export type FlightPlanOrInvalidFiling =
  | { lastValidFlightPlan: FlightPlanSummary }
  | { currentInvalid: InvalidFiling };

export interface FlightPlanSummary {
  id: FlightIdentificationOutput;
  status: FlightPlanStatus;
}
export type FlightPlanStatus =
  | 'AIRBORNE'
  | 'BACKUP'
  | 'CLOSED'
  | 'FILED'
  | 'OFFBLOCKS'
  | 'SUSPENDED'
  | 'TACT_DELETED'
  | 'TERMINATED';

export type FlightPlanMessageType =
  | 'ACH'
  | 'AFP'
  | 'APL'
  | 'ARR'
  | 'CHG'
  | 'CNL'
  | 'DEP'
  | 'DLA'
  | 'FNM'
  | 'FPL'
  | 'MFS'
  | 'RQP'
  | 'RQS';

export type FlightPlanMessageStatus =
  | 'DELETED'
  | 'DISCARD'
  | 'INVALID'
  | 'MULTIPLE'
  | 'REFERRED'
  | 'REJECTED';

export interface InvalidFiling {
  filingTime: DateTimeSecond;
  invalidMessageType: FlightPlanMessageType;
  invalidMessageStatus: FlightPlanMessageStatus;
  keys?: FlightKeys;
}

export interface FlightListReplyData {
  flights: FlightOrFlightPlan[];
}

export interface FlightListByLocationReplyData {
  effectiveTrafficWindow: DateTimeMinutePeriod;
}

export interface FlightListByAirspaceReply extends Reply {
  data: FlightListByLocationReplyData & FlightListReplyData;
}

export interface FlightPlanListRequest {
  aircraftId?: string;
  aerodromeOfDeparture?: string;
  nonICAOAerodromeOfDeparture: boolean;
  airFiled: boolean;
  aerodromeOfDestination?: string;
  nonICAOAerodromeOfDestination: boolean;
  estimatedOffBlockTime: DateTimeMinutePeriod;
}

export interface FlightPlanListReply extends Reply {
  data: {
    summaries: FlightPlanOrInvalidFiling[];
  };
}

export interface FlightRetrievalRequest {
  dataset: Dataset;
  includeProposalFlights: boolean;
  flightId: FlightIdentificationInput;
  requestedFlightDatasets: FlightDataset[];
  requestedFlightFields?: FlightField[];
  requestedDataFormat: FlightExchangeModel;
}

export interface FlightRetrievalReply extends Reply {
  data: {
    latestFlightPlan?: FlightPlanOutput;
    flightPlanHistory?: FlightPlanHistory;
    flight?: Flight;
  };
}

export interface FlightListByTrafficVolumeRequest
  extends FlightListByLocationRequest {
  calculationType?: CountsCalculationType;
  trafficVolume: TrafficVolumeId;
  flow?: FlowId;
}

export interface FlightListByTrafficVolumeReply extends Reply {
  data: FlightListReplyData;
}

export interface FlightListByMeasureRequest
  extends FlightListByLocationRequest {
  measure: MeasureId;
  mode: FlightListByMeasureMode;
}

export type FlightListByMeasureMode =
  | 'ACTIVATED_BY_MEASURE'
  | 'CONCERNED_BY_MEASURE';

export interface FlightListByMeasureReply extends Reply {
  data: FlightListByLocationReplyData;
}
