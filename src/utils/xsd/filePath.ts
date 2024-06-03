import axios from 'axios';
import { UTCDateMini } from '@date-fns/utc';
import { format } from 'date-fns';
import { timeFormatWithSeconds } from '../timeFormats';
import { B2B_VERSION, B2BFlavour } from '../../constants';
import { getEndpoint } from '../../config';
import { Security } from '../../security';
import { createAxiosConfig } from './createAxiosConfig';

const makeQuery = ({ version }: { version: string }) => `
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:generalinformation="eurocontrol/cfmu/b2b/GeneralinformationServices"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
>
  <soap:Header />
  <soap:Body>
    <generalinformation:NMB2BWSDLsRequest>
      <sendTime>${format(new UTCDateMini(), timeFormatWithSeconds)}</sendTime>
      <version>${version}</version>
    </generalinformation:NMB2BWSDLsRequest>
  </soap:Body>
</soap:Envelope>
`;

export async function requestFilename({
  flavour,
  security,
  xsdEndpoint,
}: {
  flavour: B2BFlavour;
  security: Security;
  xsdEndpoint?: string;
}): Promise<string> {
  if (xsdEndpoint) {
    return xsdEndpoint;
  }

  if (!!security && 'apiKeyId' in security) {
    throw new Error(
      'Should never happen, config.xsdEndpoint should be defined',
    );
  }

  const res = await axios({
    url: getEndpoint({ flavour }),
    method: 'POST',
    data: makeQuery({ version: B2B_VERSION }),
    ...createAxiosConfig({ security }),
  });

  const matches = res.data.match(/<id>(.+)<\/id>/);

  if (!matches || !matches[1]) {
    throw new Error(`Could not extract WSDL tarball file from B2B response`);
  }

  return matches[1];
}
