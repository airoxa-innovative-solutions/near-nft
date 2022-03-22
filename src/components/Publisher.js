import React, { useEffect, useState } from "react";
import * as nearAPI from "near-api-js";
import { parseNearAmount } from "../state/near";
import { getMarketStoragePaid, loadItems } from "../state/views";
import { useHistory } from "../utils/history";

const PATH_SPLIT = "?t=";
const SUB_SPLIT = "&=";

const {
  utils: {
    format: { formatNearAmount },
  },
} = nearAPI;

const n2f = (amount) => parseFloat(parseNearAmount(amount, 8));

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
              //metadata: { media, bannerData },
              media_url,
              account,
              owner_id,

              sale_conditions = {},
              bids = {},
              royalty = {},
              banner_subscription_charge,
              banner_page_url,
              banner_height,
              banner_width,
              banner_uuid,
            }) =>
              accountId == account ? (
                <div key={banner_uuid} className="item">
                  <img
                    src={media_url}
                    onClick={() =>
                      history.pushState(
                        {},
                        "",
                        window.location.pathname + "?t=" + banner_uuid
                      )
                    }
                  />
                  <div>
                    {banner_page_url
                      ? "Banner URL : " + banner_page_url
                      : "http://gamer.world/p1"}
                  </div>
                  <div>
                    {banner_height
                      ? "Banner Size : " + banner_width + " x " + banner_height
                      : "Banner Size : " + 200 + " x " + 75}
                  </div>
                  <div>
                    {banner_subscription_charge
                      ? "Banner Subscription charges/10 hits : " +
                        banner_subscription_charge
                      : "Banner Subscription charges/10 hits : " + 0.3}
                  </div>

                  <div className="bannerSizeContainer">
                    <input
                      placeholder="Banner Width"
                      value={banner_width}
                      onChange={(e) => setBannerWidth(e.target.value)}
                    />
                    {"   X   "}
                    <input
                      placeholder="Banner Height"
                      value={banner_height}
                      onChange={(e) => setBannerHeight(e.target.value)}
                    />
                  </div>

                  <input
                    type="number"
                    min={0.0}
                    className="full-width"
                    placeholder="Subscription value/10 hits (Near)"
                    value={banner_subscription_charge}
                    onChange={(e) => setBannerSubscription(e.target.value)}
                  />

                  <button>Update</button>
                </div>
              ) : (
                ""
              )
          )}
        </>
      }
    </>
  );
};
