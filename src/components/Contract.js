import React, { useEffect, useState } from "react";
import * as nearAPI from "near-api-js";
import { handleMint } from "../state/actions";
import { isAccountTaken, networkId } from "../utils/near-utils";
import { useParams, useLocation } from "react-router-dom";

const { KeyPair } = nearAPI;

export const Contract = ({ near, update, account }) => {
  if (!account) return <p>Please connect your NEAR Wallet</p>;

  const [media, setMedia] = useState("");
  const [validMedia, setValidMedia] = useState("");
  const [royalties, setRoyalties] = useState({});
  const [royalty, setRoyalty] = useState([]);
  //const [receiver, setReceiver] = useState([]);
  const [bannerPageURL, setBannerPageURL] = useState("");
  const [bannerWidth, setBannerWidth] = useState("");

  const [bannerHeight, setBannerHeight] = useState("");
  const [bannerSubscription, setBannerSubscription] = useState(0.1);
  const [embedCode, setEmbedCode] = useState("");

  const urlSearch = useLocation().search;
  const transactionHashes = new URLSearchParams(urlSearch).get(
    "transactionHashes"
  );
  // let { transactionHashes } = useLocation().search;
  console.log("transactionHashes:", useParams(), transactionHashes);
  async function getState(txHash, accountId) {
    const result = await account.connection.provider.txStatus(
      txHash,
      accountId
    );
    console.log("Result: ", result);
    if (
      result?.transaction?.actions?.length > 0 &&
      result.transaction.actions[0].FunctionCall?.method_name === "nft_mint"
    ) {
      const args = result.transaction.actions[0].FunctionCall.args;
      let buff = new Buffer(args, "base64");
      let text = buff.toString("ascii");

      const argsJson = JSON.parse(text);

      console.log(argsJson?.token_id);
      if (argsJson?.token_id) {
        const scriptCode = `<script src="http://locify.io/nearadbanner.js" token_id=${argsJson.token_id}></script>`;
        setEmbedCode(scriptCode);
      }
    }
    //setEmbedCode("1131231231");
  }

  //const TX_HASH = "3Eww9FRwSsM4EUqG36iXto1uWQU39UDyakDt74ZXSH3m";
  const ACCOUNT_ID = account.accountId;
  if (transactionHashes) getState(transactionHashes, ACCOUNT_ID);

  const handleMintClick = async (account, royalties, media, validMedia) => {
    const bannerObj = {
      URL: bannerPageURL,
      width: bannerWidth,
      height: bannerHeight,
      subscription: bannerSubscription,
    };

    // const tokenId =
    handleMint(account, royalties, media, validMedia, bannerObj);
    //  setEmbedCode(tokenId);
  };

  return (
    <>
      <h4>Mint new Ad. banner</h4>
      <input
        className="full-width"
        placeholder="Banner page image URL"
        value={media}
        onChange={(e) => setMedia(e.target.value)}
      />
      <img
        src={media}
        onLoad={() => setValidMedia(true)}
        onError={() => setValidMedia(false)}
      />

      {!validMedia && <p>Banner Page image URL is invalid.</p>}

      <input
        className="full-width"
        placeholder="Banner Page URL"
        value={bannerPageURL}
        onChange={(e) => setBannerPageURL(e.target.value)}
      />

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
      {/*
      <h4>Royalties</h4>
      {Object.keys(royalties).length > 0 ? (
        Object.entries(royalties).map(([receiver, royalty]) => (
          <div key={receiver}>
            {receiver} - {royalty} %{" "}
            <button
              onClick={() => {
                delete royalties[receiver];
                setRoyalties(Object.assign({}, royalties));
              }}
            >
              ❌
            </button>
          </div>
        ))
      ) : (
        <p>No royalties added yet.</p>
      )}
      <input
        className="full-width"
        placeholder="Account ID"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
      />
      <input
        type="number"
        className="full-width"
        placeholder="Percentage"
        value={royalty}
        onChange={(e) => setRoyalty(e.target.value)}
      />
      <button
        onClick={async () => {
          const exists = await isAccountTaken(receiver);
          if (!exists)
            return alert(
              `Account: ${receiver} does not exist on ${
                networkId === "default" ? "testnet" : "mainnet"
              }.`
            );
          setRoyalties(
            Object.assign({}, royalties, {
              [receiver]: royalty,
            })
          );
        }}
      >
        Add Royalty
      </button>
*/}
      <div className="line"></div>

      <button
        onClick={() => handleMintClick(account, royalties, media, validMedia)}
      >
        Mint Banner
      </button>

      <div className="line"></div>
      {embedCode ? (
        <div>
          <div>Please embed the JS code on your web page :</div>
          <div>{embedCode}</div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};
