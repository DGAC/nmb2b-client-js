import type { SoapDeserializer } from '../utils/types';

export type DateYearMonthDay = Date;
export type DateTimeMinute = Date;
export type DateTimeSecond = Date;
export type Timestamp = Date;
export interface ShiftHourMinute {
  sign: 'MINUS' | 'PLUS';
  value: DurationHourMinute;
}

export type NMB2BVersion = string; // DIGIT{2}.DIGIT{1}.DIGIT{1}

export interface File {
  id: FileId;
  type: FileType;
  releaseTime: DateTimeSecond;
  fileLength: number;
}

export type Cost = number; // A positive or negative cost expressed in EUR.
export type FileId = string; // (ALPHA|DIGIT|.|_|-|/){1,200}
export type FileType = string; // ALPHA{1,50}

export type AirNavigationUnitId = string; // (UALPHA|DIGIT|SPECIAL_CHARACTER){1,12}
export type UserId = string; // ANY{1,12}
export type PlanDataId = string; // (O|F|S)(DIGIT){14}(UALPHA|DIGIT){0,40}

export type Colours = string; // TEXT{1,51}

// TODO: Implement proper duration (seconds) parsing
export type SignedDurationHourMinuteSecond = string; // +hhmmss / -hhmmss

export type NMInt = string;
export interface NMSet<A> {
  item: A[];
}

export interface NMList<A> {
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
export type Duration = number;

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

export type WeightKg = number; // [0, 999999]

export type FlightLevelM = number;

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
export type SimulationState = 'INITIAL' | 'CURRENT';
export interface Dataset {
  type: DatasetType;
  simulationIdentifier?: SimulationId;
  simulationState?: SimulationState;
}

export type ReceivedOrSent = 'RECEIVED' | 'SENT' | 'UNKNOWN';

export type DistanceM = number;
export type DistanceNM = number;
export type Bearing = number;

export type ReplyStatus =
  | 'OK'
  | 'INVALID_INPUT'
  | 'INVALID_OUTPUT'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'RESOURCE_OVERLOAD'
  | 'REQUEST_COUNT_QUOTA_EXCEEDED'
  | 'PARALLEL_REQUEST_COUNT_QUOTA_EXCEEDED'
  | 'REQUEST_OVERBOOKING_REJECTED'
  | 'BANDWIDTH_QUOTAS_EXCEEDED'
  | 'NOT_AUTHORISED'
  | 'OBJECT_NOT_FOUND'
  | 'TOO_MANY_RESULTS'
  | 'OBJECT_EXISTS'
  | 'OBJECT_OUTDATED'
  | 'CONFLICTING_UPDATE'
  | 'INVALID_DATASET';

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

export type ReplyWithData<TData = never> = Reply & {
  data: SoapDeserializer<TData>;
};

export type Request = {
  endUserId?: string;
  onBehalfOfUnit?: AirNavigationUnitId;
  sendTime: DateTimeSecond;
};

export type ServiceGroup =
  | 'AIRSPACE'
  | 'COMMON'
  | 'FFICE'
  | 'FLIGHT'
  | 'FLOW'
  | 'GENERAL_INFORMATION'
  | 'PUBLISH_SUBSCRIBE';

export interface B2B_Error {
  attributes?: string[];
  group: ServiceGroup;
  category: string;
  type: ErrorType;
  parameters: { [key: string]: string };
  message?: string;
}

export type ErrorType =
  | 'UNSUPPORTED_VERSION'
  | 'ATTRIBUTE_CANNOT_BE_NULL'
  | 'ATTRIBUTE_MUST_BE_NULL'
  | 'INVALID_COLLECTION_SIZE'
  | 'INVALID_ATTRIBUTE_VALUE'
  | 'MISSING_CHOICE_VALUE'
  | 'CHOICE_OVERFLOW'
  | 'REQUESTED_ATTRIBUTE_NOT_ALLOWED'
  | 'REPLY_ATTRIBUTE_NOT_SET'
  | 'REQUEST_COUNT_QUOTA_EXCEEDED'
  | 'REQUEST_OVERBOOKING_ACCEPTED'
  | 'UNKNOWN';

export type UUID = string;
export type NMRelease = string;
