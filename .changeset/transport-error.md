---
'@dgac/nmb2b-client': minor
---

Security hardening: a failure without a usable B2B reply, on a query or while loading the WSDL in `create*Client`, now throws `NMB2BTransportError` (`kind`, `service`, `query`, `code`, `httpStatus`, `url`, non-enumerable raw `body`), built from an allowlist of fields. Errors thrown or passed to `onRequestError` hooks no longer reference the HTTP client's request configuration, which held the credentials (client certificate, private key, passphrase). Transport failures no longer throw a generic `Error` with a `cause`, and no error thrown by the library carries a `cause` anymore.

See [GHSA-8hgj-fw8h-7c7v](https://github.com/DGAC/nmb2b-client-js/security/advisories/GHSA-8hgj-fw8h-7c7v).
