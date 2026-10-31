import { isAxiosError, type AxiosResponse } from 'axios';

import { NMB2BTransportError, type NMB2BTransportErrorKind } from './NMB2BTransportError.ts';

type SanitizeErrorContext = {
  /** The kind of a failure thrown by neither axios nor `soap`, e.g. a stream error. */
  kind?: NMB2BTransportErrorKind;
  /** The URL to report when the failure does not hold one. */
  url?: string;
  service?: string;
  query?: string;
  /** Put before the message, e.g. where the failure happened. */
  messagePrefix?: string;
};

/**
 * Returns an error safe to throw, which carries no credential and no `cause`:
 * - a {@link NMB2BTransportError} for a failure thrown by axios or `soap`, whose
 *   kind it infers, or for any other failure when `context` gives its kind;
 * - otherwise a plain `Error` with the original message only: a bug.
 *
 * The message is final when the error is built: changing it afterwards would
 * not update a stack trace already read.
 *
 * Only strings and numbers are copied from `err`: the result keeps no reference
 * to it, nor to the request configuration, request or response it holds, which
 * carry the credentials.
 */
export function sanitizeError(err: unknown, context: SanitizeErrorContext): Error {
  const { service, query } = context;
  const message = `${context.messagePrefix ?? ''}${describeFailure(err)}`;

  // A response was received, but it is not a usable B2B reply. Checked before
  // axios errors, so that the kind does not depend on `soap` disabling axios'
  // status validation (`validateStatus: null`, except with NTLM).
  if (isSoapResponseError(err)) {
    const url = err.response.config.url ?? context.url;

    return new NMB2BTransportError({
      message,
      kind: soapResponseErrorKind(err),
      service,
      query,
      httpStatus: err.response.status,
      url,
      body: err.body,
    });
  }

  // No response received (network failure, timeout, TLS error), or an error
  // status while loading the WSDL.
  if (isAxiosError(err)) {
    const url = err.config?.url ?? context.url;

    return new NMB2BTransportError({
      message,
      kind: err.response ? 'http' : 'network',
      service,
      query,
      code: err.code,
      httpStatus: err.response?.status,
      url,
      body: typeof err.response?.data === 'string' ? err.response.data : undefined,
    });
  }

  // Neither a transport failure nor one the caller knows the kind of.
  if (!context.kind) {
    return new Error(message);
  }

  // A failure the caller knows the kind of, e.g. a connection lost while
  // reading a response body, or a corrupt WSDL archive.
  return new NMB2BTransportError({
    message,
    kind: context.kind,
    service,
    query,
    code: isNodeError(err) && typeof err.code === 'string' ? err.code : undefined,
    url: context.url,
  });
}

/**
 * States what went wrong.
 *
 * On an error status or an unreadable body, it comes from what the library
 * knows, since what `soap` throws depends on the body, and never includes that
 * body: see {@link NMB2BTransportError.body}. A SOAP fault keeps its own message.
 */
function describeFailure(err: unknown): string {
  if (isSoapResponseError(err)) {
    const kind = soapResponseErrorKind(err);

    if (kind === 'http') {
      return `HTTP status ${err.response.status}`;
    }

    if (kind === 'parse') {
      return `Unreadable reply (HTTP status ${err.response.status})`;
    }
  }

  return err instanceof Error ? err.message : 'Unknown error';
}

/**
 * What `soap` throws when a response was received but is not a usable reply
 * (`soap/lib/client.js`): an error status, an unreadable body or a SOAP fault.
 *
 * `soap` sends its requests with axios: `response` is the axios response.
 */
type SoapResponseError = {
  response: AxiosResponse<unknown>;
  /** Raw response body. */
  body: string;
  /** Parsed envelope, attached on a SOAP fault only (`soap/lib/wsdl/index.js`). */
  root?: unknown;
};

function isSoapResponseError(err: unknown): err is SoapResponseError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'body' in err &&
    typeof err.body === 'string' &&
    'response' in err &&
    typeof err.response === 'object' &&
    err.response !== null &&
    'status' in err.response &&
    typeof err.response.status === 'number'
  );
}

function soapResponseErrorKind(err: SoapResponseError): NMB2BTransportErrorKind {
  if (err.root !== undefined) {
    return 'fault';
  }

  return err.response.status >= 400 ? 'http' : 'parse';
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}
