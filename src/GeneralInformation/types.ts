import type { Reply, NMB2BVersion, File } from '../Common/types';

export interface NMB2BWSDLsRequest {
  version: NMB2BVersion;
}

export interface NMB2BWSDLsReply extends Reply {
  data: NMB2BWSDLsReplyData;
}

export interface NMB2BWSDLsReplyData {
  file: B2BInfoFile;
}

export interface B2BInfoFile extends File {
  hasAddendaErrata?: boolean;
}
