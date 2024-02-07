import type { Config } from '../config';

export interface BaseServiceInterface {
  __soapClient: object;
  config: Config;
}
