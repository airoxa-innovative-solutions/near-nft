import React, { useEffect, useState } from "react";
import * as nearAPI from "near-api-js";
import { parseNearAmount } from "../state/near";
import { getMarketStoragePaid, loadItems } from "../state/views";
import { useHistory } from "../utils/history";

import { SubscribeBanner } from "./SubscribeBanner";

const PATH_SPLIT = "?t=";
const SUB_SPLIT = "&=";

const {
  utils: {
    format: { formatNearAmount },
  },
} = nearAPI;

const n2f = (amount) => parseFloat(parseNearAmount(amount, 8));

export const MarketPlace = ({
  app,
  views,
  update,
  contractAccount,
  account,
  loading,
  dispatch,
}) => {
  if (!contractAccount) return null;

  const { tab, sort, filter } = app;
  const { tokens, sales, allTokens, marketStoragePaid } = views;

  console.log("tokens:", tokens);

  console.log("sales:", sales);
  console.log("allTokens:", allTokens);

  let accountId = "";
  if (account) accountId = account.accountId;

  /// market
  const [offerPrice, setOfferPrice] = useState("");
  const [offerToken, setOfferToken] = useState("near");

  /// updating user tokens
  const [price, setPrice] = useState("");
  const [ft, setFT] = useState("near");
  const [saleConditions, setSaleConditions] = useState({});

  useEffect(() => {
    if (!loading) {
      dispatch(loadItems(account));
      dispatch(getMarketStoragePaid(account));
    }
  }, [loading]);

  // path to token
  const [path, setPath] = useState(window.location.href);
  useHistory(() => {
    setPath(window.location.href);
  });
  let tokenId;
  let pathSplit = path.split(PATH_SPLIT)[1];
  if (allTokens.length && pathSplit?.length) {
    console.log(pathSplit);
    tokenId = pathSplit.split(SUB_SPLIT)[0];
  }

  const currentSales = sales.filter(
    ({ owner_id, sale_conditions }) =>
      account?.accountId === owner_id &&
      Object.keys(sale_conditions || {}).length > 0
  );

  let market = tokens;

  return (
    <>
      {
        <center>
          {tab !== 2 && (
            <button
              onClick={() => update("app.filter", filter === 2 ? 1 : 2)}
              style={{ background: "#fed" }}
            >
              {filter === 1 ? "All" : "Sales"}
            </button>
          )}
          <button
            onClick={() => update("app.sort", sort === 2 ? 1 : 2)}
            style={{ background: sort === 1 || sort === 2 ? "#fed" : "" }}
          >
            Date {sort === 1 && "⬆️"}
            {sort === 2 && "⬇️"}
          </button>
          {tab !== 2 && (
            <button
              onClick={() => update("app.sort", sort === 4 ? 3 : 4)}
              style={{ background: sort === 3 || sort === 4 ? "#fed" : "" }}
            >
              Price {sort === 3 && "⬆️"}
              {sort === 4 && "⬇️"}
            </button>
          )}
        </center>
      }
      {market.map(
        ({
          // metadata: { media },
          media_url,
          owner_id,
          token_id,
          sale_conditions = {},
          bids = {},
          royalty = {},
          banner_subscription_charge,
          banner_page_url,
          banner_height,
          banner_width,
          banner_uuid,
        }) => (
          <div key={banner_uuid} className="item">
            <img
              crossOrigin=""
              src={media_url}
              onClick={() =>
                history.pushState(
                  {},
                  "",
                  window.location.pathname + "?t=" + banner_uuid
                )
              }
            />

            <div>Adv. URL : {banner_page_url}</div>
            <div>Banner Width : {banner_width}</div>
            <div>Banner Height: {banner_height}</div>
            <div>
              Subscription Charges/10 hits : {banner_subscription_charge} near
            </div>

            <SubscribeBanner
              {...{ account, banner_uuid, banner_subscription_charge }}
            />
          </div>
        )
      )}
    </>
  );
};
