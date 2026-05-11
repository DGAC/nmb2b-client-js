export type * from './Airspace/types.ts';
export type * from './Common/types.ts';
export type * from './Flight/types.ts';
export type * from './Flow/types.ts';
export type * from './GeneralInformation/types.ts';

import type { SoapDeserializer } from './utils/types.ts';

export type SafeB2BDeserializedResponse<TResponsePart> =
  SoapDeserializer<TResponsePart>;
