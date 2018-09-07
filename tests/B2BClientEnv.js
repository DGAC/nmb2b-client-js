const { getClients } = require('./utils');
const NodeEnvironment = require('jest-environment-node');

class B2BClientEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();

    this.global.__B2B_CLIENT__ = await getClients();

    /**
     * Why are we injecting Date into the runner environment ?
     * https://github.com/facebook/jest/issues/6877
     */
    this.global.Date = Date;
    this.global.Array = Array;
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = B2BClientEnvironment;
