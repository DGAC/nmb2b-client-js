---
'@dgac/nmb2b-client': major
---

- Rename `make*Client` to `create*Client`
- Change export paths:
  - `@dgac/nmb2b-client` exports B2B client builders
  - `@dgac/nmb2b-client/config` exports utilities to check the B2B client builder configuration
  - `@dgac/nmb2b-client/security` exports utilities to create the `security` object required by a B2B client builder
    `@dgac/nmb2b-client/types` exports typescript types representing the XSD types defined in the B2B XSD
- Drop node v18 support, test against node 24
- Publish as ESM only package (with correct `module-sync` resolution for usage in commonjs context)
- Migrate build to `tsdown`
