const execSync = require('child_process').execSync;

const IGNORE = ['**/*.test.js'];

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv),
  });

console.log('Building CommonJS modules ...');

exec(`babel src -d dist --ignore ${IGNORE.map(s => `'${s}'`).join(',')}`, {
  BABEL_ENV: 'cjs',
});

exec(`flow-copy-source -i ${IGNORE.map(s => `'${s}'`).join(',')} src dist`, {});
