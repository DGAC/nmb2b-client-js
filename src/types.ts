import type { SoapDeserializer } from './utils/types.js';

export type * from './Airspace/types.js';
export type * from './Common/types.js';
export type * from './Flight/types.js';
export type * from './Flow/types.js';
export type * from './GeneralInformation/types.js';

export type SafeB2BDeserializedResponse<TResponsePart> =
  SoapDeserializer<TResponsePart>;
