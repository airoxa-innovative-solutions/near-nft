import React, { useEffect, useState } from "react";
import * as nearAPI from "near-api-js";
import {
  parseNearAmount,
  token2symbol,
  getTokenOptions,
  handleOffer,
} from "../state/near";
import { formatAccountId } from "../utils/near-utils";
import { getMarketStoragePaid, loadItems } from "../state/views";
import {
  handleAcceptOffer,
  handleRegisterStorage,
  handleSaleUpdate,
  handleSubscribe,
} from "../state/actions";
import { useHistory } from "../utils/history";
import { Token } from "./Token";

import { SubscribeBanner } from "./SubscribeBanner";

const PATH_SPLIT = "?t=";
const SUB_SPLIT = "&=";

const {
  utils: {
    format: { formatNearAmount },
  },
} = nearAPI;

const n2f = (amount) => parseFloat(parseNearAmount(amount, 8));

const sortFunctions = {
  1: (a, b) =>
    parseInt(a.metadata.issued_at || "0") -
    parseInt(b.metadata.issued_at || "0"),
  2: (b, a) =>
    parseInt(a.metadata.issued_at || "0") -
    parseInt(b.metadata.issued_at || "0"),
  3: (a, b) =>
    n2f(a.sale_conditions?.near || "0") - n2f(b.sale_conditions?.near || "0"),
  4: (b, a) =>
    n2f(a.sale_conditions?.near || "0") - n2f(b.sale_conditions?.near || "0"),
};

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
  /*
  let market = sales;

  if (tab !== 2 && filter === 1) {
    market = market.concat(
      allTokens.filter(
        ({ token_id }) => !market.some(({ token_id: t }) => t === token_id)
      )
    );
  }

  market = [
    ...market,
    {
      metadata: {
        media:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlXL7iUSNx3paSbh5VS6Oz3ceOFMBVOpEufA&usqp=CAU",
      },
      owner_id: "abc",
      token_id: "token-1647448551539",
    },
  ];*/

  let market = tokens;
  // if (market) market.sort(sortFunctions[sort]);
  // if (tokens) tokens.sort(sortFunctions[sort]);
  /*
  const token = market.find(({ token_id }) => tokenId === token_id);
  if (token) {
    return <Token {...{ dispatch, account, token }} />;
  }*/

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
          media = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlXL7iUSNx3paSbh5VS6Oz3ceOFMBVOpEufA&usqp=CAU",
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
              src={media}
              onClick={() =>
                history.pushState(
                  {},
                  "",
                  window.location.pathname + "?t=" + banner_uuid
                )
              }
            />
            {/*    <p>
              {accountId !== owner_id
                ? `Owned by ${formatAccountId(owner_id)}`
                : `You own this!`}
            </p>
              */}
            <div>Adv. URL : {banner_page_url}</div>
            <div>Banner Width : {banner_width}</div>
            <div>Banner Height: {banner_height}</div>
            <div>
              Subscription Charges/10 hits : {banner_subscription_charge} near
            </div>
            {/* <button onClick={() => handleSubscribe(account, token_id)}>
              Subscribe
            </button> */}
            <SubscribeBanner
              {...{ account, banner_uuid, banner_subscription_charge }}
            />

            {/*Object.keys(sale_conditions).length > 0 && (
              <>
                <h4>Royalties</h4>
                {Object.keys(royalty).length > 0 ? (
                  Object.entries(royalty).map(([receiver, amount]) => (
                    <div key={receiver}>
                      {receiver} - {amount / 100}%
                    </div>
                  ))
                ) : (
                  <p>This token has no royalties.</p>
                )}
              </>
            )*/}
            {/*Object.keys(sale_conditions).length > 0 && (
              <>
                <h4>Sale Conditions</h4>
                {Object.entries(sale_conditions).map(([ft_token_id, price]) => {
                  return (
                    <>
                      <div className="margin-bottom" key={ft_token_id}>
                        {price === "0" ? "open" : formatNearAmount(price, 4)} -{" "}
                        {token2symbol[ft_token_id]}
                      </div>
                      <div className="margin-bottom">
                        {price === "0" ? "open" : formatNearAmount(price, 4)}
                        {getTokenOptions(
                          offerToken,
                          setOfferToken,
                          Object.keys(sale_conditions)
                        )}
                        <button
                          onClick={() =>
                            handleOffer(
                              account,
                              token_id,
                              offerToken,
                              offerPrice
                            )
                          }
                        >
                          Offer
                        </button>
                      </div>
                    </>
                  );
                })*/}
            {/*accountId.length > 0 && accountId !== owner_id && (
                  <>
                    <input
                      type="number"
                      placeholder="Price"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                    />
                    {getTokenOptions(
                      offerToken,
                      setOfferToken,
                      Object.keys(sale_conditions)
                    )}
                    <button
                      onClick={() =>
                        handleOffer(account, token_id, offerToken, offerPrice)
                      }
                    >
                      Offer
                    </button>
                  </>
                )}
              </>
                    )*/}
            {/*Object.keys(bids).length > 0 && (
              <>
                <h4>Offers</h4>
                {Object.entries(bids).map(([ft_token_id, ft_token_bids]) =>
                  ft_token_bids.map(({ owner_id: bid_owner_id, price }) => (
                    <div className="offers" key={ft_token_id}>
                      <div>
                        {price === "0" ? "open" : formatNearAmount(price, 4)} -{" "}
                        {token2symbol[ft_token_id]} by {bid_owner_id}
                      </div>
                      {accountId === owner_id && (
                        <button
                          onClick={() =>
                            handleAcceptOffer(account, token_id, ft_token_id)
                          }
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  ))
                )}
              </>
                        )*/}
          </div>
        )
      )}
    </>
  );
};
