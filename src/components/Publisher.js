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
} from "../state/actions";
import { useHistory } from "../utils/history";
import { Token } from "./Token";

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

export const Publisher = ({
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
  console.log(views);
  let accountId = "";
  if (account) accountId = account.accountId;

  /// market
  const [offerPrice, setOfferPrice] = useState("");
  const [offerToken, setOfferToken] = useState("near");

  /// updating user tokens
  const [price, setPrice] = useState("");
  const [ft, setFT] = useState("near");
  const [saleConditions, setSaleConditions] = useState({});

  const [bannerWidth, setBannerWidth] = useState("200");

  const [bannerHeight, setBannerHeight] = useState("75");
  const [bannerSubscription, setBannerSubscription] = useState(0.3);
  const [embedCode, setEmbedCode] = useState("");

  const token_id = "token-1234567890123456";

  useEffect(() => {
    const scriptCode = `<script src="http://locify.io/nearadbanner.js" token_id=${token_id}></script>`;
    setEmbedCode(scriptCode);
  }, [token_id]);

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

  let market = sales;
  if (tab !== 2 && filter === 1) {
    market = market.concat(
      allTokens.filter(
        ({ token_id }) => !market.some(({ token_id: t }) => t === token_id)
      )
    );
  }
  market.sort(sortFunctions[sort]);
  tokens.sort(sortFunctions[sort]);

  const token = market.find(({ token_id }) => tokenId === token_id);
  if (token) {
    return <Token {...{ dispatch, account, token }} />;
  }

  return (
    <>
      {
        <center>
          <button
            onClick={() => update("app.sort", sort === 2 ? 1 : 2)}
            style={{ background: sort === 1 || sort === 2 ? "#fed" : "" }}
          >
            Date {sort === 1 && "⬆️"}
            {sort === 2 && "⬇️"}
          </button>
        </center>
      }

      {
        <>
          {!tokens.length && (
            <p className="margin">No NFTs. Try minting something!</p>
          )}
          {tokens.map(
            ({
              metadata: { media, bannerData },
              owner_id,
              token_id,
              sale_conditions = {},
              bids = {},
              royalty = {},
            }) => (
              <div key={token_id} className="item">
                <img
                  src={media}
                  onClick={() =>
                    history.pushState(
                      {},
                      "",
                      window.location.pathname + "?t=" + token_id
                    )
                  }
                />
                <div>
                  {bannerData
                    ? "Banner URL : " + bannerData?.URL
                    : "http://gamer.world/p1"}
                </div>
                <div>
                  {bannerData
                    ? "Banner Size : " +
                      bannerData?.width +
                      " x " +
                      bannerData?.height
                    : "Banner Size : " + 200 + " x " + 75}
                </div>
                <div>
                  {bannerData
                    ? "Banner Subscription charges/10 hits : " +
                      bannerData?.subscription
                    : "Banner Subscription charges/10 hits : " + 0.3}
                </div>

                <div className="bannerSizeContainer">
                  <input
                    placeholder="Banner Width"
                    value={bannerWidth}
                    onChange={(e) => setBannerWidth(e.target.value)}
                  />
                  {"   X   "}
                  <input
                    placeholder="Banner Height"
                    value={bannerHeight}
                    onChange={(e) => setBannerHeight(e.target.value)}
                  />
                </div>

                <input
                  type="number"
                  min={0.0}
                  className="full-width"
                  placeholder="Subscription value/10 hits (Near)"
                  value={bannerSubscription}
                  onChange={(e) => setBannerSubscription(e.target.value)}
                />

                <button>Update</button>

                {/*marketStoragePaid !== "0" ? (
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
                    {Object.keys(sale_conditions).length > 0 && (
                      <>
                        <h4>Current Sale Conditions</h4>
                        {Object.entries(sale_conditions).map(
                          ([ft_token_id, price]) => (
                            <div className="margin-bottom" key={ft_token_id}>
                              {price === "0"
                                ? "open"
                                : formatNearAmount(price, 4)}{" "}
                              - {token2symbol[ft_token_id]}
                            </div>
                          )
                        )}
                      </>
                    )}
                    {
                      // saleConditions.length > 0 &&
                      // 	<div>
                      // 		<h4>Pending Sale Updates</h4>
                      // 		{
                      // 			saleConditions.map(({ price, ft_token_id }) => <div className="margin-bottom" key={ft_token_id}>
                      // 				{price === '0' ? 'open' : formatNearAmount(price, 4)} - {token2symbol[ft_token_id]}
                      // 			</div>)
                      // 		}
                      // 		<button className="pulse-button" onClick={() => handleSaleUpdate(account, token_id)}>Update Sale Conditions</button>
                      // 	</div>
                    }
                    {accountId === owner_id && (
                      <>
                        <div>
                          <h4>Add Sale Conditions</h4>
                          <input
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                          />
                          {getTokenOptions(ft, setFT)}
                          <button
                            onClick={() => {
                              if (!price.length) {
                                return alert("Enter a price");
                              }
                              const newSaleConditions = {
                                ...saleConditions,
                                [ft]: parseNearAmount(price),
                              };
                              setSaleConditions(newSaleConditions);
                              setPrice("");
                              setFT("near");
                              handleSaleUpdate(
                                account,
                                token_id,
                                newSaleConditions
                              );
                            }}
                          >
                            Add
                          </button>
                        </div>
                        <div>
                          <i style={{ fontSize: "0.75rem" }}>
                            Note: price 0 means open offers
                          </i>
                        </div>
                      </>
                    )}
                    {Object.keys(bids).length > 0 && (
                      <>
                        <h4>Offers</h4>
                        {Object.entries(bids).map(
                          ([ft_token_id, { owner_id, price }]) => (
                            <div className="offers" key={ft_token_id}>
                              <div>
                                {price === "0"
                                  ? "open"
                                  : formatNearAmount(price, 4)}{" "}
                                - {token2symbol[ft_token_id]}
                              </div>
                              <button
                                onClick={() =>
                                  handleAcceptOffer(token_id, ft_token_id)
                                }
                              >
                                Accept
                              </button>
                            </div>
                          )
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <div className="center">
                    <button onClick={() => handleRegisterStorage(account)}>
                      Register with Market to Sell
                    </button>
                  </div>
                )*/}
              </div>
            )
          )}
        </>
      }
    </>
  );
};
