---
'@dgac/nmb2b-client': patch
---

Security hardening: debug logs no longer contain the `user:password@` of `config.endpoint` or `config.xsdEndpoint`, in the logged configuration nor in the logged WSDL archive URL. See [GHSA-8hgj-fw8h-7c7v](https://github.com/DGAC/nmb2b-client-js/security/advisories/GHSA-8hgj-fw8h-7c7v).
