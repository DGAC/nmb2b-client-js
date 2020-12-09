export type RouteId = string; // (UALPHA|DIGIT){1,7}
export type PublishedPointId = string; // (UALPHA|DIGIT){1,5}
export type AerodromeSetId = string; // ANY{1,8}
export type AirspaceId = string; // ANY{1,12}
export type DBEPointId = string; // (UALPHA|DIGIT|*){1,5}
export type RestrictionId = string; // (UALPHA|DIGIT){1,10}
export type TrafficVolumeId = string; // (ALPHA|DIGIT){1,8}
export type AerodromeIATAId = string; // UALPHA{3}
export type AerodromeIATAOrICAOId = string; // UALPHA{3,4}
export type TrafficVolumeSetId = string;
export type TrafficVolumeIdWildcard = string;
export type TrafficVolumeSetIdWildcard = string;

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
  fileLength: string;
  id: string;
  releaseTime: string;
  type: string;
}

import {
  DateYearMonthDay,
  AirNavigationUnitId,
  DateTimeMinutePeriod,
  LastUpdate,
  Bearing,
  DistanceNM,
  DateYearMonthDayPeriod,
  Position,
} from '../Common/types';

export interface AUPChain {
  chainDate: DateYearMonthDay;
  amcId: AirNavigationUnitId;
  aups: AUPSummary[];
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
  aupState: AUPState;
  nilAUP: boolean;
  remark: string;
  note: Array<string | null>;
  expandedAUP: boolean;
  lastUpdate: LastUpdate;
  isP3?: boolean;
}

type ADRMessageType = object; // eurocontrol.cfmu.cua.b2b.aixm.ADRMessage
export interface AUPManualEntries {
  cdrs: ADRMessageType;
  rsas: ADRMessageType;
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
  | 'A' // Hundreds of feet
  | 'F' // Standard FlightLevel,
  | 'M' // Altitude in tens of meters
  | 'MM' // Altitude in meters
  | 'S' // Standard metric level in tens of meters
  | 'SS'; // Standard metric level in meters

export interface FlightLevel {
  unit: FlightLevelUnit;
  level?: number;
  ground?: boolean;
  ceiling?: boolean;
}

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
  | { DCT: void }
  | { route: RouteId }
  | { SID: TerminalProcedureIdentifier }
  | { STAR: TerminalProcedureIdentifier };

export interface TerminalProcedureIdentifier {
  id: RouteId;
  aerodromeId: AerodromeIATAOrICAOId;
}

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
  | 'CRSA'
  | 'CS'
  | 'ERSA'
  | 'ES'
  | 'FIR'
  | 'IFPZ'
  | 'NAS'
  | 'REG';

interface CompleteDatasetSummary {
  updateId: string;
  publicationDate: DateYearMonthDay;
  sourceAIRACs: [AiracIdentifier] | [AiracIdentifier, AiracIdentifier];
  files: AIXMFile[];
}

type CompleteDatasetQueryCriteria =
  | { publicationPeriod: DateYearMonthDayPeriod }
  | { airac: AiracIdentifier }
  | { date: DateYearMonthDay };

export interface FlightLevelRange {
  min: FlightLevel;
  max: FlightLevel;
}
