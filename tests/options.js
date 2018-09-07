/* @flow */
const dotenv = require('dotenv');
dotenv.config();
const invariant = require('invariant');
const path = require('path');
const fs = require('fs');
const { fromEnv } = require('../dist/security');

const XSD_PATH = process.env.B2B_XSD_PATH || path.join(__dirname, '../b2b-xsd');
const security = !process.env.CI
  ? fromEnv()
  : {
      cert: Buffer.from(process.env.NM_B2B_PEM || '', 'utf8'),
      key: Buffer.from(process.env.NM_B2B_PEM_KEY || '', 'utf8'),
      passphrase: process.env.NM_B2B_PASSPHRASE || null,
    };

const flavour = process.env.B2B_FLAVOUR || 'OPS';

module.exports = {
  XSD_PATH,
  security,
  flavour,
};
