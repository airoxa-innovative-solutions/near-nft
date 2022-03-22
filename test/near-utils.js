const fs = require("fs");
const nearAPI = require("near-api-js");
const getConfig = require("../src/config");
const { nodeUrl, networkId, contractName, contractMethods } = getConfig();
const {
  keyStores: { InMemoryKeyStore },
  Near,
  Account,
  Contract,
  KeyPair,
  utils: {
    format: { parseNearAmount },
  },
} = nearAPI;
