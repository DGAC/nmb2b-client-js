import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fromEnv } from '../src/security';

const XSD_PATH = process.env.B2B_XSD_PATH || path.join(__dirname, '../b2b-xsd');
const security = fromEnv();
const flavour = (process.env.B2B_FLAVOUR || 'OPS') as any as 'OPS' | 'PREOPS';
const endpoint = process.env.B2B_ENDPOINT;
const xsdEndpoint = process.env.B2B_XSD_REMOTE_URL;

const ex = {
  XSD_PATH,
  security,
  flavour,
  ...(!!endpoint && { endpoint }),
  ...(!!xsdEndpoint && { xsdEndpoint }),
};

export default ex;
