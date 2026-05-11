import type { Config } from '../config.ts';

export interface BaseServiceInterface {
  __soapClient: object;
  config: Config;
}
