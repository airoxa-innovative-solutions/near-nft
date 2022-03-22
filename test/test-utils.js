const BN = require("bn.js");
const fetch = require("node-fetch");
const nearAPI = require("near-api-js");
const {
  KeyPair,
  Account,
  Contract,
  utils: {
    format: { parseNearAmount },
  },
} = nearAPI;
const {
  near,
  connection,
  keyStore,
  contract,
  contractAccount,
} = require("./near-utils");
const getConfig = require("../src/config");
const {
  networkId,
  contractName,
  contractMethods,
  DEFAULT_NEW_ACCOUNT_AMOUNT,
  DEFAULT_NEW_CONTRACT_AMOUNT,
} = getConfig();
