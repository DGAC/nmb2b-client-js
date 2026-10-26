# Transport errors are built from an allowlist, without `cause`

A transport error (`NMB2BTransportError`) is a new object built from the `service` and `query` being executed, and from selected primitive fields (`kind`, `code`, `httpStatus`, `url`, `body`) copied from the failure thrown by `soap` or axios, and thrown without `cause`: it keeps no reference to that failure. The axios error references the request configuration, the request and the response, which hold the credentials (Basic auth header, HTTPS agent with the certificate, key and passphrase); error tooling walking `cause` would ship them to log storage or third-party services. With an allowlist, a field a future `soap` or axios version adds cannot reach the consumer, and `src/transportError.test.ts` checks that no credential is reachable by any property path. The stack trace is the library's own throw site.

The same holds for every error the library throws: none carries a `cause`. A failure that is neither an HTTP nor a SOAP failure is a bug or a configuration error, not a transport error: it is thrown as a plain `Error` that keeps the original message only, since the original may reference what holds the credentials. The one `cause` left wraps a non-`Error` value thrown by the consumer's own code, for `onRequestError` hooks only: it is never thrown, and holds nothing the library put there.

## Rejected alternative

**Redact the HTTP client's error and keep it as `cause`**: delete or mask `config`, `request`, headers and agent options before rethrowing. It keeps the full original error for debugging, but it depends on the internal shape of axios and `soap`, and every field a dependency upgrade adds reopens the leak silently.
