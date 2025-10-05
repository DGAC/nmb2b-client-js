---
'@dgac/nmb2b-client': minor
---

Implement query hooks.

Hooks are user provided callbacks which will be executed during the SOAP query process.

Basic example :

```typescript
const client = await createB2BClient({
  // ... other options,
  hooks: [
    function onRequestStart({ service, query, input }) {
      console.log(`Query ${query} of service ${service} was invoked with input`, input)
    }
  ]
})
```

A hook can return an optional object containing success / error hooks :

```typescript
const client = await createB2BClient({
  // ... other options,
  hooks: [
    function onRequestStart({ service, query, input }) {
      const startTime = new Date();

      console.log(
        `Query ${query} of service ${service} was invoked with input:`,
        input,
      );

      return {
        onRequestSuccess: ({ response }) => {
          const durationMs = new Date().valueOf() - startTime;
          console.log(`Query took ${durationMs}ms`);
          console.log(`Query responded with`, response);
        },
        onRequestError: ({ error }) => {
          const durationMs = new Date().valueOf() - startTime;
          console.log(`Query took ${durationMs}ms`);
          console.log(`Query failed with error ${error.message}`);
        },
      };
    },
  ],
});
```

Hooks can also be async :

```typescript
const client = await createB2BClient({
  // ... other options,
  hooks: [
    async function onRequestStart({ service, query, input }) {
      await sendLog(`Query ${query} of service ${service} was invoked`);
    },
  ],
});
```

To get proper typescript support when creating custom hooks, a `createHook()` function helper is now exported :

```typescript
import { createHook } from '@dgac/nmb2b-client';

const withPrometheusMetrics = createHook(({ service, query }) => {
  prometheusCounter.inc({ service, query, status: 'started' });

  return {
    onRequestSuccess: () =>
      prometheusCounter.inc({ service, query, status: 'completed' }),
    onRequestError: () =>
      prometheusCounter.inc({ service, query, status: 'completed' }),
  };
});

// ... in another file

const b2bClient = await createB2BClient({
  // ... other options
  hooks: [withPrometheusMetrics],
});
```
