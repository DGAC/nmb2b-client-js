const dotenv = require('dotenv');
dotenv.config();
const invariant = require('invariant');
const path = require('path');
const fs = require('fs');
const { fromEnv } = require('../dist/security');

const XSD_PATH = process.env.B2B_XSD_PATH || path.join(__dirname, '../b2b-xsd');
const security = fromEnv();
const flavour = process.env.B2B_FLAVOUR || 'OPS';
const endpoint = process.env.B2B_ENDPOINT;
const xsdEndpoint = process.env.B2B_XSD_REMOTE_URL;

module.exports = {
  XSD_PATH,
  security,
  flavour,
  ...(!!endpoint && { endpoint }),
  ...(!!xsdEndpoint && { xsdEndpoint }),
};
