export type DateYearMonthDay = Date;
export type DateTimeMinute = Date;
export type DateTimeSecond = Date;
export type Timestamp = Date;
export interface ShiftHourMinute {
  sign: 'MINUS' | 'PLUS';
  value: DurationHourMinute;
}

export type AirNavigationUnitId = string; // ANY{1,12}
export type UserId = string; // ANY{1,12}
export type PlanDataId = string; // (O|F|S)(DIGIT){14}(UALPHA|DIGIT){0,40}

export type BooleanString = 'true' | 'false';
export type NMInt = string;
export interface NMSet<A> {
  item: A[];
}
export interface NMMap<K, V> {
  item: Array<{
    key: K;
    value: V;
  }>;
}

export type DurationHourMinute = number;
export type DurationMinute = number;
export type DurationHourMinuteSecond = number;

export interface DateYearMonthDayPeriod {
  wef?: DateYearMonthDay;
  unt?: DateYearMonthDay;
}

export interface DateTimeMinutePeriod {
  wef: DateTimeMinute;
  unt: DateTimeMinute;
}

export type TimeHourMinute = string; // DIGIT{2}:DIGIT{2}
export interface TimeHourMinutePeriod {
  wef: TimeHourMinute;
  unt: TimeHourMinute;
}

export interface LastUpdate {
  timestamp: DateTimeSecond;
  userId: UserId;
  airNavigationUnitId?: AirNavigationUnitId;
}

export interface Position {
  latitude: Latitude;
  longitude: Longitude;
}

export interface Latitude {
  angle: string;
  side: LatitudeSide;
}

export type LatitudeSide = string;

export interface Longitude {
  angle: string;
  side: LongitudeSide;
}

export type LongitudeSide = string;

export type DatasetType = 'FORECAST' | 'OPERATIONAL' | 'SIMULATION';
export type SimulationId = string; // ANY{1,100}
export interface Dataset {
  type: DatasetType;
  simulationId?: SimulationId;
}

export type ReceivedOrSent = 'RECEIVED' | 'SENT' | 'UNKNOWN';

export type DistanceM = number;
export type DistanceNM = number;
export type Bearing = number;

export type ReplyStatus =
  | 'CONFLICTING_UPDATE'
  | 'INTERNAL_ERROR'
  | 'INVALID_DATASET'
  | 'INVALID_INPUT'
  | 'INVALID_OUTPUT'
  | 'NOT_AUTHORISED'
  | 'OBJECT_EXISTS'
  | 'OBJECT_NOT_FOUND'
  | 'OBJECT_OUTDATED'
  | 'OK'
  | 'OVERLOAD'
  | 'SERVICE_UNAVAILABLE'
  | 'TOO_MANY_RESULTS';

export interface Reply {
  requestReceptionTime?: DateTimeSecond;
  requestId?: string;
  sendTime?: DateTimeSecond;
  status: ReplyStatus;
  inputValidationErrors?: B2B_Error[];
  outputValidationErrors?: B2B_Error[];
  warnings?: B2B_Error[];
  slaError?: B2B_Error;
  reason?: string;
}

export interface Request {
  endUserId?: string;
  sendTime: DateTimeSecond;
}

export type ServiceGroup =
  | 'AIRSPACE'
  | 'COMMON'
  | 'FLIGHT'
  | 'FLOW'
  | 'GENERAL_INFORMATION'
  | 'PUBLISH_SUBSCRIBE';

// tslint:disable-next-line
export interface B2B_Error {
  attributes?: string[];
  group: ServiceGroup;
  category: string;
  type: string;
  parameters: { [key: string]: string };
  message?: string;
}

export type UUID = string;
export type NMRelease = string;
