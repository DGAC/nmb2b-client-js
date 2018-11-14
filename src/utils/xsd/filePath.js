/* @flow */
import request from 'request';
import { fromEnv } from '../../security';
import dotenv from 'dotenv';
import path from 'path';
import moment from 'moment';
import { timeFormatWithSeconds } from '../timeFormats';
import { B2B_VERSION, type B2BFlavour } from '../../constants';
import { getEndpoint } from '../../config';
import { type Security } from '../../security';

const makeQuery = ({ version }) => `
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:generalinformation="eurocontrol/cfmu/b2b/GeneralinformationServices"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
>
  <soap:Header />
  <soap:Body>
    <generalinformation:NMB2BWSDLsRequest>
      <sendTime>${moment.utc().format(timeFormatWithSeconds)}</sendTime>
      <version>${version}</version>
    </generalinformation:NMB2BWSDLsRequest>
  </soap:Body>
</soap:Envelope>
`;

export async function requestFilename({
  flavour,
  security,
}: {
  flavour: B2BFlavour,
  security: Security,
}): Promise<string> {
  // NM B2B takes a long long time to respond here
  // Hardcode the return value which (hopefully) should not change
  return 'b2b_publications/22.0.0/B2B_WSDL_XSD.22.0.0.4.84.tar.gz';
  
  // return new Promise((resolve, reject) => {
  //   request.post(
  //     {
  //       agentOptions: security,
  //       timeout: 15 * 1000,
  //       url: getEndpoint({ flavour }),
  //       body: makeQuery({ version: B2B_VERSION }),
  //     },
  //     (e, r, body) => {
  //       console.log('BLABLABLA');
  //       console.log(body);
  //       if (e) {
  //         return reject(e);
  //       }
  //
  //       if (r.statusCode !== 200) {
  //         return reject(r);
  //       }
  //
  //       resolve(body);
  //     },
  //   );
  // });
}
