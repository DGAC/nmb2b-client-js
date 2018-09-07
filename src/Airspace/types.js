/* @flow */
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
      airacId: AIRACId,
    }
  | { airacSequenceNumber: number };

export type AirSpeed = {
  speed: number,
  unit: SpeedUnit,
};

export type NetworkAddress = {
  network: 'AFTN' | 'OTHER' | 'SITA', // Network
  address: string, // NetworkAddress_DataType ANY{1,8},
};

export type SpeedUnit =
  | 'FEET_PER_MINUTE'
  | 'KILOMETERS_PER_HOUR'
  | 'KNOTS'
  | 'MACH_NUMBER'
  | 'UNDEFINED';

export type AIRACId = string; // Pattern DIGIT{4}
export type AerodromeICAOId = string;
export type AIXMFile = {
  fileLength: string,
  id: string,
  releaseTime: string,
  type: string,
};

import type {
  DateYearMonthDay,
  AirNavigationUnitId,
  DateTimeMinutePeriod,
  LastUpdate,
  Bearing,
  DistanceNM,
  DateYearMonthDayPeriod,
} from '../Common/types';

export type AUPChain = {
  chainDate: DateYearMonthDay,
  amcId: AirNavigationUnitId,
  aups: Array<AUPSummary>,
};

export type AUPId = string;
export type AUPType = 'BASELINE' | 'UPDATE';
export type AUPState = 'DRAFT' | 'READY' | 'RELEASED';
export type AUPSummary = {
  id: AUPId,
  originatingAupId?: AUPId,
  chainDate: DateYearMonthDay,
  amcId?: AirNavigationUnitId,
  aupType: AUPType,
  validityPeriod: DateTimeMinutePeriod,
  aupState: AUPState,
  nilAUP: boolean,
  remark: string,
  note: Array<?string>,
  expandedAUP: boolean,
  lastUpdate: LastUpdate,
};

type ADRMessageType = Object; // eurocontrol.cfmu.cua.b2b.aixm.ADRMessage
export type AUPManualEntries = {
  cdrs: ADRMessageType,
  rsas: ADRMessageType,
};

export type AUPComputedEntries = {
  implicitCDRs?: ADRMessageType,
  mergedCDRs?: ADRMessageType,
  implicitRSAs?: ADRMessageType,
};

export type AUP = {
  summary: AUPSummary,
  aupManualEntries?: AUPManualEntries,
  aupComputedEntries?: AUPComputedEntries,
};

export type FlightLevelUnit =
  | 'A' // Hundreds of feet
  | 'F' // Standard FlightLevel,
  | 'M' // Altitude in tens of meters
  | 'MM' // Altitude in meters
  | 'S' // Standard metric level in tens of meters
  | 'SS'; // Standard metric level in meters

export type FlightLevel = {
  unit: FlightLevelUnit,
  level?: number,
  ground?: boolean,
  ceiling?: boolean,
};

export type TerminalProcedure =
  | {| id: RouteId |}
  | {| DCT: void |}
  | {| pointId: PublishedPointId |};

export type ReferenceLocationAerodrome = {|
  type: 'AERODROME',
  id: AerodromeICAOId,
|};

export type ReferenceLocationAerodromeSet = {|
  type: 'AERODROME_SET',
  id: AerodromeSetId,
|};

export type ReferenceLocationAirspace = {|
  type: 'AIRSPACE',
  id: AirspaceId,
|};

export type ReferenceLocationDBEPoint = {|
  type: 'DBE_POINT',
  id: DBEPointId,
|};

export type ReferenceLocationPublishedPoint = {|
  type: 'PUBLISHED_POINT',
  id: PublishedPointId,
|};

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
  | {| DCT: void |}
  | {| route: RouteId |}
  | {| SID: TerminalProcedureIdentifier |}
  | {| STAR: TerminalProcedureIdentifier |};

export type TerminalProcedureIdentifier = {
  id: RouteId,
  aerodromeId: AerodromeIATAOrICAOId,
};

export type ICAOPoint =
  | {| pointId: PublishedPointId |}
  | {| nonPublishedPoint: NonPublishedPoint |};

export type NonPublishedPoint = GeoPoint | DBEPoint | ReferencePoint;
export type GeoPoint = {| position: Position |};
export type DBEPoint = {| dbePointId: DBEPointId |};
export type ReferencePoint = {|
  reference: PublishedPointId,
  bearing: Bearing,
  distance: DistanceNM,
|};

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

type CompleteDatasetSummary = {
  updateId: string,
  publicationDate: DateYearMonthDay,
  sourceAIRACs: [AiracIdentifier] | [AiracIdentifier, AiracIdentifier],
  files: Array<AIXMFile>,
};

type CompleteDatasetQueryCriteria =
  | {| publicationPeriod: DateYearMonthDayPeriod |}
  | {| airac: AiracIdentifier |}
  | {| date: DateYearMonthDay |};

export type FlightLevelRange = {
  min: FlightLevel,
  max: FlightLevel,
};
