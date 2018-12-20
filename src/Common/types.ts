/* @flow */
export type DateYearMonthDay = Date;
export type DateTimeMinute = Date;
export type DateTimeSecond = Date;
export type Timestamp = Date;
export type ShiftHourMinute = {
  sign: 'MINUS' | 'PLUS';
  value: DurationHourMinute;
};

export type AirNavigationUnitId = string; // ANY{1,12}
export type UserId = string; // ANY{1,12}
export type PlanDataId = string; // (O|F|S)(DIGIT){14}(UALPHA|DIGIT){0,40}

export type BooleanString = 'true' | 'false';
export type NMInt = string;
export type NMSet<A> = {
  item: Array<A>;
};
export type NMMap<K, V> = {
  item: Array<{
    key: K;
    value: V;
  }>;
};

export type DurationHourMinute = number;
export type DurationMinute = number;
export type DurationHourMinuteSecond = number;

export type DateYearMonthDayPeriod = {
  wef?: DateYearMonthDay;
  unt?: DateYearMonthDay;
};

export type DateTimeMinutePeriod = {
  wef: DateTimeMinute;
  unt: DateTimeMinute;
};

export type TimeHourMinute = string; // DIGIT{2}:DIGIT{2}
export type TimeHourMinutePeriod = {
  wef: TimeHourMinute;
  unt: TimeHourMinute;
};

export type LastUpdate = {
  timestamp: DateTimeSecond;
  userId: UserId;
  airNavigationUnitId?: AirNavigationUnitId;
};

export type DatasetType = 'FORECAST' | 'OPERATIONAL' | 'SIMULATION';
export type SimulationId = string; // ANY{1,100}
export type Dataset = {
  type: DatasetType;
  simulationId?: SimulationId;
};

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
  inputValidationErrors?: Array<B2B_Error>;
  outputValidationErrors?: Array<B2B_Error>;
  warnings?: Array<B2B_Error>;
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

export type B2B_Error = {
  attributes?: Array<string>;
  group: ServiceGroup;
  category: string;
  type: string;
  parameters: { [key: string]: string };
  message?: string;
};

export type UUID = string;
export type NMRelease = string;
