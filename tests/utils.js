const dotenv = require('dotenv');
dotenv.config();
const { fromEnv } = require('../dist/security');
const { makeB2BClient } = require('../dist');
const path = require('path');
const fs = require('fs');
const b2bOptions = require('./options');

let client;

async function getClients(args) {
  if (process.env.CI && !process.env.REAL_B2B_CONNECTIONS) {
    console.log('Running in CI context, disabling connections to NM B2B');
    return;
  }

  if (client && !(args && args.fresh)) {
    return client;
  }

  client = await makeB2BClient(b2bOptions);
  return client;
}

module.exports = { getClients };
