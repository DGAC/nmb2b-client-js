---
'@dgac/nmb2b-client': minor
---

Implement SOAP subscription management, and FlightData subscription creation/update/retrieval.

- Added `Common` services client, created via `createCommonClient()` or `createB2BClient()`
- Implemented subscription management requests :
  - Common.abortSubscriptionSynchronisation()
  - Common.deleteSubscription()
  - Common.listSubscriptions()
  - Common.pauseSubscription()
  - Common.pullMessages()
  - Common.resumeSubscription()
  - Common.subscriptionHistory()
  - Common.synchroniseSubscription()
  - Flight.createFlightDataSubscription()
  - Flight.retrieveFlightDataSubscription()
  - Flight.updateFlightDataSubscription()
