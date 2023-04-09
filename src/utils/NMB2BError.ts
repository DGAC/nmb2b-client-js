import type { B2B_Error, Reply, ReplyStatus } from '../Common/types';

/**
 * Represents an error response received from NM B2B
 */
export class NMB2BError extends Error {
  /**
   * UTC time at which the request was received at NM.
   *
   * Always set when an XML reply is returned, regardless of the possible exceptions that occurred within the request processing.
   */
  declare requestReceptionTime?: Date;

  /**
   * Identification of the request. This id is not unique across time: the request is uniquely identified via two attributes: `requestReceptionTime` and `requestId`.
   *
   * Always set when an XML reply is returned, regardless of the possible exceptions that occurred within the request processing.
   */
  declare requestId?: string;

  /**
   * UTC time at which NM has sent the reply.
   *
   * Always set when an XML reply is returned, regardless of the possible exceptions that occurred within the request processing.
   */
  declare sendTime?: Date;

  /**
   * Status code explaining the error.
   */
  declare status: Exclude<ReplyStatus, 'OK'>;

  /**
   * Contains the input validation errors, if any.
   * Set to null if the request successfully passed input validations (i.e. status is not set to `INVALID_INPUT`).
   */
  declare inputValidationErrors?: Array<B2B_Error>;

  /**
   * Contains the output validation errors, if any.
   * Set to null if the request successfully passed output validations (i.e. status is not set to `INVALID_OUTPUT`).
   */
  declare outputValidationErrors?: Array<B2B_Error>;

  /**
   * Warnings, if any
   */
  declare warnings?: Array<B2B_Error>;

  /**
   * Describes an error caused by a SLA violation.
   *
   */
  declare slaError?: B2B_Error;

  declare reason?: string;

  constructor({
    reply,
  }: {
    reply: Reply & { status: Exclude<ReplyStatus, 'OK'> };
  }) {
    super();

    if (reply.requestId) {
      this.requestId = reply.requestId;
    }

    if (reply.requestReceptionTime) {
      this.requestReceptionTime = reply.requestReceptionTime;
    }

    if (reply.sendTime) {
      this.sendTime = reply.sendTime;
    }

    if (reply.inputValidationErrors) {
      this.inputValidationErrors = reply.inputValidationErrors;
    }

    if (reply.warnings) {
      this.warnings = reply.warnings;
    }

    if (reply.slaError) {
      this.slaError = reply.slaError;
    }

    if (reply.reason) {
      this.reason = reply.reason;
    }
    this.status = reply.status;
    this.message = this.status;

    if (this.reason) {
      this.message = `${this.message}: ${this.reason}`;
    }
  }
}
