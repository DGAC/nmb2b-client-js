module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8'
        }
      }
    ],
    '@babel/preset-flow'
  ],
  overrides: [
    {
      test: ['./src/**/*.ts'],
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: '8'
            }
          }
        ],
        '@babel/preset-typescript'
      ]
    }
  ]
};
