---
'@dgac/nmb2b-client': patch
---

Implement isolated WSDL caching for custom `xsdEndpoint` configurations.

- **Feature**: When `xsdEndpoint` is configured, WSDL files are now stored in a unique cache directory derived from the endpoint URL. This prevents cache corruption when switching between different sources (e.g. official NM B2B vs internal proxy).
- **Migration**: The default cache directory (used when no `xsdEndpoint` is provided) has been renamed from `{version}` to `{version}-network-manager` to ensure isolation from legacy caches. **This will trigger a one-time automatic re-download of WSDL files.**
