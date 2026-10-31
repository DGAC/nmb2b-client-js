---
'@dgac/nmb2b-client': patch
---

`NMB2BTransportError` built from a query response now states what went wrong in its `message` (`HTTP status 504`, `Invalid response body (HTTP status 200)`), instead of `Unknown error` or whatever `soap` threw.
