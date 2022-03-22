import { marketId, contractId } from "../state/near";
const nearAPI = require("near-api-js");

const { keyStores } = nearAPI;
import { getContractSigner } from "../utils/near-utils";

const BAD_OWNER_ID = [];
// api-helper config
const domain = "https://helper.nearapi.org";
const batchPath = domain + "/v1/batch/";
const headers = new Headers({
  "max-age": "300",
});

const ADD_SALE = "__ADD_SALE";

export const getMarketStoragePaid =
  (account) =>
  async ({ update, getState }) => {
    if (!account) return;
    const { contractAccount } = getState();
  };

export const loadItems =
  (account) =>
  async ({ update, getState }) => {
    const { contractAccount } = getState();

    /// user tokens
    let tokens = [];
    if (account) {
      const { accountId } = account;
      console.log("all_banner.... is init.. on:", contractId);
      tokens = await contractAccount.viewFunction(contractId, "all_banner", {
        account_id: account.accountId,
        from_index: "0",
        limit: 50,
      });
      console.log("raw tokens string...:", tokens);

      const keyStore = new keyStores.BrowserLocalStorageKeyStore();
      const { contract } = await getContractSigner({ keyPair: keyStore });

      tokens = await contract.all_banner();
      console.log("raw tokens string from contractSigner ...:", tokens);
      console.log("all_banner.... was called ");

      //  tokens = "[" + tokens.replace(/}\r/g, "},") + "]";
      //console.log(tokens);

      tokens = JSON.parse("[" + tokens.replace(/}{/g, "},{") + "]");
      //     tokens = JSON.parse(tokens);

      console.log("tokens:", tokens);
      const sales = [];

      // merge tokens with sale data if it's on sale
      for (let i = 0; i < tokens.length; i++) {
        const { token_id } = tokens[i];
        let sale = sales.find(({ token_id: t }) => t === token_id);
        // don't have it in state, go find sale data
        if (!sale) {
          sale = await contractAccount
            .viewFunction(marketId, "get_sale", {
              nft_contract_token: contractId + ":" + token_id,
            })
            .catch(() => {});
        }
        tokens[i] = Object.assign(tokens[i], sale || {});
      }
    }
    console.log("test pt 1:");

    /// all sales
    // need to use NFT helper for deployed contract
    let sales = [];
    if (process.env.REACT_APP_API_HELPER === "true") {
      const salesUrl =
        batchPath +
        JSON.stringify([
          {
            contract: marketId,
            method: "get_sales_by_nft_contract_id",
            args: {
              nft_contract_id: contractId,
            },
            batch: {
              from_index: "0", // must be name of contract arg (above)
              limit: "1000", // must be name of contract arg (above)
              step: 50, // divides contract arg 'limit'
              flatten: [], // how to combine results
            },
            sort: {
              path: "metadata.issued_at",
            },
          },
        ]);
      sales = (await fetch(salesUrl, { headers }).then((res) => res.json()))[0];
    } else {
    }

    console.log("test pt 2:");

    // all tokens
    // need to use NFT helper for deployed
    let allTokens = [];
    if (process.env.REACT_APP_API_HELPER === "true") {
      const nft_total_supply = await contractAccount.viewFunction(
        contractId,
        "nft_total_supply"
      );
      const allTokensUrl =
        batchPath +
        JSON.stringify([
          {
            contract: contractId,
            method: "nft_tokens",
            args: {},
            batch: {
              from_index: "0", // must be name of contract arg (above)
              limit: nft_total_supply, // must be name of contract arg (above)
              step: 50, // divides contract arg 'limit'
              flatten: [], // how to combine results
            },
            sort: {
              path: "metadata.issued_at",
            },
          },
        ]);
      allTokens = (
        await fetch(allTokensUrl, { headers }).then((res) => res.json())
      )[0];
    }

    allTokens = allTokens.filter(
      ({ owner_id }) => !BAD_OWNER_ID.includes(owner_id)
    );

    console.log("udpate t,s, at", tokens, sales, allTokens);

    update("views", { tokens, sales, allTokens });
    return { tokens, sales, allTokens };
  };
