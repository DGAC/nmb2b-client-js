module.exports = {
  collectCoverageFrom: ['src/**/*.js', 'src/**/*.ts'],
  reporters: ['default', 'jest-junit'],
  transform: {
    '^.+\\.js?$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.ts?$': '<rootDir>/node_modules/babel-jest',
  },
  testMatch: [
    '**/__tests__/**/*.(js|ts)?(x)',
    '**/?(*.)+(spec|test).(js|ts)?(x)',
  ],
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: './tests/B2BClientEnv.js',
};
