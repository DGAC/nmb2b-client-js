import { stripUrlCredentials } from './stripUrlCredentials.ts';

/**
 * What went wrong when no usable B2B reply was obtained:
 * - `network`: the connection failed before a complete HTTP response was received
 *   (connection failure, timeout, TLS error, connection lost while reading the body…);
 * - `http`: an HTTP response was received with an error status;
 * - `parse`: a response was received but could not be read (not XML, a WSDL
 *   archive with an invalid content type or corrupt…);
 * - `fault`: the server answered with a SOAP fault.
 */
export type NMB2BTransportErrorKind = 'network' | 'http' | 'parse' | 'fault';

/**
 * Represents a failure where no usable reply was obtained from NM B2B: the
 * request did not go through, or what came back is not a B2B reply.
 *
 * Compare with {@link NMB2BError}, thrown when NM processed the request and
 * returned a reply whose status is not `OK`.
 *
 * Built from an allowlist of facts about the failure: it never references the
 * underlying HTTP client's error, request or response, nor any credential.
 */
export class NMB2BTransportError extends Error {
  override readonly name = 'NMB2BTransportError';

  /**
   * What went wrong, see {@link NMB2BTransportErrorKind}.
   */
  readonly kind: NMB2BTransportErrorKind;

  /**
   * Name of the B2B service being queried, if any.
   */
  readonly service?: string;

  /**
   * Name of the B2B query being executed. Absent when loading the WSDL.
   */
  readonly query?: string;

  /**
   * System error code (`ECONNRESET`, `ETIMEDOUT`, `ECONNABORTED`, TLS codes…), if any.
   */
  readonly code?: string;

  /**
   * HTTP status of the response, when one was received.
   */
  readonly httpStatus?: number;

  /**
   * URL of the request, without credentials: any `user:password@` is removed.
   * `'INVALID_URL'` when it is not a valid HTTP(S) URL, which could not be
   * cleaned.
   */
  readonly url?: string;

  /**
   * Raw response body, when one was received, untruncated.
   *
   * Non-enumerable, to keep large HTML pages out of default serialisation.
   *
   * This is unfiltered server content: whatever the server or a proxy sent
   * back, the library cannot vouch for it.
   */
  declare readonly body?: string;

  constructor({
    message,
    kind,
    service,
    query,
    code,
    httpStatus,
    url,
    body,
  }: { message: string } & Pick<
    NMB2BTransportError,
    'kind' | 'service' | 'query' | 'code' | 'httpStatus' | 'url' | 'body'
  >) {
    super(message);

    this.kind = kind;
    this.service = service;
    this.query = query;
    this.code = code;
    this.httpStatus = httpStatus;
    this.url = url && stripUrlCredentials(url);

    // Non-enumerable, see `body`.
    Object.defineProperty(this, 'body', { value: body });
  }
}
