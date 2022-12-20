// const { getClients, getSoapClients } = require('./utils');
import { TestEnvironment } from 'jest-environment-node';

class B2BClientEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();

    // this.global.__B2B_CLIENT__ = await getClients();
    this.global.__DISABLE_B2B_CONNECTIONS__ =
      process.env.CI && !process.env.REAL_B2B_CONNECTIONS;
    // this.global.__SOAP_CLIENTS__ = await getSoapClients();

    /**
     * Why are we injecting Date into the runner environment ?
     * https://github.com/facebook/jest/issues/6877
     */
    // this.global.Date = Date;
    // this.global.Array = Array;
  }

  async teardown() {
    await super.teardown();
  }
}

export default B2BClientEnvironment;
