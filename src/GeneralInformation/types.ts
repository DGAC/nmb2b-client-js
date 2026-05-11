import type {
  B2BRequest,
  File,
  NMB2BVersion,
  ReplyWithData,
} from '../Common/types.ts';

export type NMB2BWSDLsRequest = B2BRequest & {
  version: NMB2BVersion;
};

export type NMB2BWSDLsReply = ReplyWithData<NMB2BWSDLsReplyData>;

export interface NMB2BWSDLsReplyData {
  file: B2BInfoFile;
}

export interface B2BInfoFile extends File {
  hasAddendaErrata?: boolean;
}

export type UserInformationRequest = Record<string, never> & B2BRequest;

export type UserInformationReply = ReplyWithData<UserInformationReplyData>;

export type UserInformationReplyData = {
  textReport: TextReport;
};

export type TextReport = string;
