---
'@dgac/nmb2b-client': patch
---

Improved error handling for SOAP queries: unexpected errors thrown during SOAP query execution are now wrapped in a standard `Error` object. This new error includes a descriptive message identifying the failing service and query (e.g., `[Query service.query] Error thrown during query execution...`) and preserves the original error as the `cause`.
