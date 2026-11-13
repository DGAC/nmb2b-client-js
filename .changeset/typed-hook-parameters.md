---
'@dgac/nmb2b-client': minor
---

Type hook parameters per query: narrowing on `service` and `query` types `input` as the query's request and `response` as its OK reply.

```typescript
createHook(() => ({
  onRequestSuccess: ({ service, query, response }) => {
    if (service === 'Flight' && query === 'queryFlightPlans') {
      response.data?.summaries; // response: FlightPlanListReply & { status: 'OK' }, no cast
    }
  },
}));
```
