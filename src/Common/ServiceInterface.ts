import type { Config } from '../config.js';

export interface BaseServiceInterface {
  __soapClient: object;
  config: Config;
}
