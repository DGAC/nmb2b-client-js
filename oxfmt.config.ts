import { defineConfig } from 'oxfmt';

export default defineConfig({
  printWidth: 80,
  singleQuote: true,
  trailingComma: 'all',
  sortPackageJson: {
    sortScripts: true,
  },
  ignorePatterns: [
    'pnpm-lock.yaml',
    '.changeset/*.md',
    '**/__fixtures__/**/*.json',
    'CHANGELOG.md',
    'CHANGELOG.old.md',
  ],
});
