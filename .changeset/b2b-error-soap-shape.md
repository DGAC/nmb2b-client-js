---
'@dgac/nmb2b-client': patch
---

Fix the types of `NMB2BError`'s `inputValidationErrors`, `outputValidationErrors`, `warnings` and `slaError`, which did not match what NM sends: code relying on them read `undefined` or threw at runtime.
