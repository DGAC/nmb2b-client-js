---
'@dgac/nmb2b-client': minor
---

Safer B2B response types.

Typings will now contain `null | undefined` when there's a risk a partial deserialization.

A type helper `SafeB2BDeserializedResponse` is now exported, and will apply a safe type transformation to any typed exported from `@dgac/nmb2b-client/*/types`.

See https://github.com/DGAC/nmb2b-client-js/issues/149 for more information.
