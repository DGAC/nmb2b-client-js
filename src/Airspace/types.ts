import type {
  AirNavigationUnitId,
  Bearing,
  DateTimeMinute,
  DateTimeMinutePeriod,
  DateTimeSecond,
  DateYearMonthDay,
  DateYearMonthDayPeriod,
  DistanceNM,
  LastUpdate,
  Position,
  ReplyWithData,
} from '../Common/types.js';

export type RouteId = string; // (UALPHA|DIGIT){1,7}
export type PublishedPointId = string; // (UALPHA|DIGIT){1,5}
export type AerodromeSetId = string; // ANY{1,8}
export type AirspaceId = string; // ANY{1,12}
export type DBEPointId = string; // (UALPHA|DIGIT|*){1,5}
export type RestrictionId = string; // (UALPHA|DIGIT|SPECIAL_CHARACTER){1,10}
export type TrafficVolumeId = string; // (UALPHA|DIGIT|SPECIAL_CHARACTER){1,8}
export type AerodromeIATAId = string; // UALPHA{3}
export type AerodromeIATAOrICAOId = string; // UALPHA{3,4}
export type TrafficVolumeSetId = string; // (UALPHA|DIGIT|SPECIAL_CHARACTER){1,8}
export type TrafficVolumeIdWildcard = string; // (UALPHA|DIGIT|SPECIAL_CHARACTER|*){1,8}
export type TrafficVolumeSetIdWildcard = string; // (UALPHA|DIGIT|SPECIAL_CHARACTER|*){1,8}

export type AiracIdentifier =
  | {
      airacId: AIRACId;
    }
  | { airacSequenceNumber: number };

export interface AirSpeed {
  speed: number;
  unit: SpeedUnit;
}

export interface NetworkAddress {
  network: 'AFTN' | 'OTHER' | 'SITA'; // Network
  address: string; // NetworkAddress_DataType ANY{1,8},
}

export type SpeedUnit =
  | 'FEET_PER_MINUTE'
  | 'KILOMETERS_PER_HOUR'
  | 'KNOTS'
  | 'MACH_NUMBER'
  | 'UNDEFINED';

export type AIRACId = string; // Pattern DIGIT{4}
export type AerodromeICAOId = string;
export interface AIXMFile {
  id: string;
  fileLength: number;
  releaseTime: DateTimeSecond;
  type: string;
}

export interface AUPChain {
  chainDate: DateYearMonthDay;
  amcId: AirNavigationUnitId;
  aups: AUPSummary[];
}

export interface EAUPChain {
  chainDate: DateYearMonthDay;
  eaups: EAUPSummary[];
}

export type AUPId = string;
export type AUPType = 'BASELINE' | 'UPDATE';
export type AUPState = 'DRAFT' | 'READY' | 'RELEASED';
export interface AUPSummary {
  id: AUPId;
  originatingAupId?: AUPId;
  chainDate: DateYearMonthDay;
  amcId?: AirNavigationUnitId;
  aupType: AUPType;
  validityPeriod: DateTimeMinutePeriod;
  releaseTime?: DateTimeMinute;
  aupState: AUPState;
  nilAUP: boolean;
  remark: string;
  note: Array<string>;
  expandedAUP: boolean;
  lastUpdate?: LastUpdate;
  isP3?: boolean;
}

export interface EAUPSummary {
  releaseTime: DateTimeMinute;
  validityPeriod: DateTimeMinutePeriod;
  eaupId: EAUPIdentification;
}

export interface EAUPIdentification {
  chainDate: DateYearMonthDay;
  sequenceNumber: number;
}

type ADRMessageType = object; // eurocontrol.cfmu.cua.b2b.aixm.ADRMessage
export interface AUPManualEntries {
  cdrs?: ADRMessageType;
  rsas?: ADRMessageType;
  radRestrictionActivations?: ADRMessageType;
}

export interface AUPComputedEntries {
  implicitCDRs?: ADRMessageType;
  mergedCDRs?: ADRMessageType;
  implicitRSAs?: ADRMessageType;
}

export interface AUP {
  summary: AUPSummary;
  aupManualEntries?: AUPManualEntries;
  aupComputedEntries?: AUPComputedEntries;
}

export type FlightLevelUnit =
  /**
   * Hundreds of feet
   */
  | 'A'
  /**
   * Standard flight level
   */
  | 'F'
  /**
   * Altitude in tens of meters
   */
  | 'M'
  /**
   * Altitude in meters
   */
  | 'MM'
  /**
   * Standard metric level in tens of meters
   */
  | 'S'
  /**
   * Standard metric level in meters
   */
  | 'SS';

export interface FlightLevel {
  unit: FlightLevelUnit;
  level?: number;
  ground?: boolean;
  ceiling?: boolean;
}

// DIGIT{2}(UALPHA| ){0,1}
export type RunwayId = string;

export type TerminalProcedure =
  | { id: RouteId }
  | { DCT: void }
  | { pointId: PublishedPointId };

export interface ReferenceLocationAerodrome {
  type: 'AERODROME';
  id: AerodromeICAOId;
}

export interface ReferenceLocationAerodromeSet {
  type: 'AERODROME_SET';
  id: AerodromeSetId;
}

export interface ReferenceLocationAirspace {
  type: 'AIRSPACE';
  id: AirspaceId;
}

export interface ReferenceLocationDBEPoint {
  type: 'DBE_POINT';
  id: DBEPointId;
}

export interface ReferenceLocationPublishedPoint {
  type: 'PUBLISHED_POINT';
  id: PublishedPointId;
}

export type ReferenceLocation =
  | ReferenceLocationAirspace
  | ReferenceLocationAerodrome
  | ReferenceLocationAerodromeSet
  | ReferenceLocationPublishedPoint
  | ReferenceLocationDBEPoint;

type ReferenceLocationMapper = {
  ReferenceLocationAirspace: ReferenceLocationAirspace;
  ReferenceLocationAerodrome: ReferenceLocationAerodrome;
  ReferenceLocationAerodromeSet: ReferenceLocationAerodromeSet;
  ReferenceLocationPublishedPoint: ReferenceLocationPublishedPoint;
  ReferenceLocationDBEPoint: ReferenceLocationDBEPoint;
};

export type ReferenceLocationUnionWithPrefix<TPrefix extends string> = {
  [TKey in keyof ReferenceLocationMapper]: {
    [TSubKey in `${TPrefix}-${TKey}`]: ReferenceLocationMapper[TKey];
  };
}[keyof ReferenceLocationMapper];

export type ReferenceLocationUnionWithPrefixOptional<TPrefix extends string> = {
  [TKey in keyof ReferenceLocationMapper]: {
    [TSubKey in `${TPrefix}-${TKey}`]?:
      | undefined
      | ReferenceLocationMapper[TKey];
  };
}[keyof ReferenceLocationMapper];

export type WithReferenceLocationOnPrefix<TPrefix extends string> =
  ReferenceLocationUnionWithPrefix<TPrefix>;

export type WithReferenceLocationOnPrefixOptional<TPrefix extends string> =
  ReferenceLocationUnionWithPrefixOptional<TPrefix>;

export type FIRICAOId = string; // UALPHA{4}

export type FlightPlanProcessing =
  | 'AERODROME_FLIGHT_RULE'
  | 'DCT_LIMIT'
  | 'FRA_DCT_LIMIT'
  | 'PROFILE_TUNING'
  | 'RAD'
  | 'SSR_CODE_ALLOCATION'
  | 'TP_AIRCRAFT_TYPE_CLASSIFICATION';

export type LoadState =
  | 'HIGH_THRESHOLD'
  | 'LOW_THRESHOLD'
  | 'NORMAL'
  | 'OVERLOAD'
  | 'UNDEFINED';

export type RouteOrTerminalProcedure =
  | { DCT: null }
  | { route: RouteId }
  | { SID: TerminalProcedureIdentifier }
  | { STAR: TerminalProcedureIdentifier };

export interface TerminalProcedureIdentifier {
  id: RouteId;
  aerodromeId: AerodromeIATAOrICAOId;
}

export type AerodromeOrPublishedPointId =
  | { aerodrome: AerodromeICAOId }
  | { point: PublishedPointId };

export type ICAOPoint =
  | { pointId: PublishedPointId }
  | { 'nonPublishedPoint-DBEPoint': DBEPoint }
  | { 'nonPublishedPoint-GeoPoint': GeoPoint }
  | { 'nonPublishedPoint-ReferencePoint': ReferencePoint };

export type NonPublishedPoint = GeoPoint | DBEPoint | ReferencePoint;
export interface GeoPoint {
  position: Position;
}
export interface DBEPoint {
  dbePointId: DBEPointId;
}
export interface ReferencePoint {
  reference: PublishedPointId;
  bearing: Bearing;
  distance: DistanceNM;
}

export type AirspaceType =
  | 'AOI'
  | 'AOP'
  | 'AREA'
  | 'AUA'
  | 'AUAG'
  | 'CDA'
  | 'CLUS'
  | 'CRAS'
  | 'CRSA'
  | 'CS'
  | 'ERAS'
  | 'ERSA'
  | 'ES'
  | 'FIR'
  | 'IFPZ'
  | 'NAS'
  | 'REG';

export interface CompleteDatasetSummary {
  updateId: string;
  publicationDate: DateYearMonthDay;
  sourceAIRACs: [AiracIdentifier] | [AiracIdentifier, AiracIdentifier];
  files: AIXMFile[];
}

export type CompleteDatasetQueryCriteria =
  | { publicationPeriod: DateYearMonthDayPeriod }
  | { airac: AiracIdentifier }
  | { date: DateYearMonthDay };

export interface FlightLevelRange {
  min: FlightLevel;
  max: FlightLevel;
}

export interface CompleteAIXMDatasetRequest {
  queryCriteria: CompleteDatasetQueryCriteria;
}

export type CompleteAIXMDatasetReply = ReplyWithData<{
  datasetSummaries: CompleteDatasetSummary[];
}>;

export interface AUPRetrievalRequest {
  aupId: AUPId;
  returnComputed?: boolean;
}

export type AUPRetrievalReply = ReplyWithData<{
  aup: AUP;
}>;

export interface AUPChainRetrievalRequest {
  chainDate: DateYearMonthDay;
  amcIds?: AirNavigationUnitId[];
}

export type AUPChainRetrievalReply = ReplyWithData<{
  chains: AUPChain[];
}>;

export interface EAUPChainRetrievalRequest {
  chainDate: DateYearMonthDay;
}

export type EAUPChainRetrievalReply = ReplyWithData<{
  chain: EAUPChain;
}>;
