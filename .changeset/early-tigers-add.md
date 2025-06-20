---
'@dgac/nmb2b-client': major
---

- Drop node v18 support, test against node 24
- Publish as ESM only package (with correct `module-sync` resolution for usage in commonjs context)
  - To consume this package in a commonjs context with typescript, use the [`customConditions`](https://www.typescriptlang.org/tsconfig/#customConditions) tsconfig option with `module-sync` as value.
- Migrate build to `tsdown`
