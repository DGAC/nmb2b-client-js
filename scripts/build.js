const execSync = require('child_process').execSync;

const IGNORE = ['**/*.test.js', '**/*.test.ts'];

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv),
  });

console.log('Building CommonJS modules ...');

exec(
  `babel src -d dist --extensions '.js,.ts' --ignore ${IGNORE.map(
    (s) => `'${s}'`,
  ).join(',')}`,
  {
    BABEL_ENV: 'cjs',
  },
);

console.log('Building TS declarations');

exec(`tsc --project tsconfig.build.json --emitDeclarationOnly`);
