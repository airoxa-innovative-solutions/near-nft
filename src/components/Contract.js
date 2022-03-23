import React, { useEffect, useState } from "react";
import * as nearAPI from "near-api-js";
import { handleMint } from "../state/actions";

import { useParams, useLocation } from "react-router-dom";

const { KeyPair } = nearAPI;

export const Contract = ({ near, update, account }) => {
  if (!account) return <p>Please connect your NEAR Wallet</p>;

  const [media, setMedia] = useState("");
  const [validMedia, setValidMedia] = useState("");
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
      result.transaction.actions[0].FunctionCall?.method_name === "add_banner"
    ) {
      const args = result.transaction.actions[0].FunctionCall.args;
      let buff = new Buffer(args, "base64");
      let text = buff.toString("ascii");

      const argsJson = JSON.parse(text);

      console.log(argsJson?.banner_uuid);
      if (argsJson?.banner_uuid) {
        const full = location.protocol + "//" + location.host;
        const scriptCode = `<script src="${full}/embed.js" banner_uuid=${argsJson.banner_uuid}></script>`;
        setEmbedCode(scriptCode);
      }
    }
    //setEmbedCode("1131231231");
  }

  //const TX_HASH = "3Eww9FRwSsM4EUqG36iXto1uWQU39UDyakDt74ZXSH3m";
  const ACCOUNT_ID = account.accountId;
  if (transactionHashes) getState(transactionHashes, ACCOUNT_ID);

  const handleMintClick = async (account, media, validMedia) => {
    const bannerObj = {
      URL: bannerPageURL,
      width: bannerWidth,
      height: bannerHeight,
      subscription: bannerSubscription,
    };

    // const tokenId =
    handleMint(account, media, validMedia, bannerObj);
    //  setEmbedCode(tokenId);
  };

  const CopyToClipboard1 = (containerid) => {
    if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(document.getElementById(containerid));
      range.select().createTextRange();
      document.execCommand("copy");
    } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(document.getElementById(containerid));
      window.getSelection().addRange(range);
      document.execCommand("copy");
      alert("Embed Code has been copied.");
    }
  };

  const CopyToClipboard = (containerid) => {
    var range = document.createRange();
    range.selectNode(containerid); //changed here
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    alert("data copied");
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
        crossOrigin=""
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

      {/* <div className="line"></div> */}

      <button onClick={() => handleMintClick(account, media, validMedia)}>
        Mint Banner
      </button>

      {/*  <div className="line"></div> */}
      {embedCode ? (
        <div>
          <div>Please embed the JS code on your web page :</div>
          <div>
            <div id="embedCode">{embedCode}</div>
            <button
              id="button1"
              onClick={() => navigator.clipboard.writeText(`${embedCode}`)}
            >
              Click to copy
            </button>
          </div>
          <br />
          <br />
        </div>
      ) : (
        ""
      )}
    </>
  );
};
