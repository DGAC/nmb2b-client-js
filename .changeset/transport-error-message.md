---
'@dgac/nmb2b-client': patch
---

`NMB2BTransportError` built from a query response now states what went wrong in its `message` (`HTTP status 504`, `Unreadable reply (HTTP status 200, Content-Type: text/html)`), instead of `Unknown error` or whatever `soap` threw.
