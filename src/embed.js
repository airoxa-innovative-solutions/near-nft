var curScriptElement = document.currentScript;
import(
  "https://cdn.jsdelivr.net/npm/near-api-js@0.44.2/dist/near-api-js.js"
).then(() => {
  // open a connection to the NEAR platform
  (async function () {
    const config = {
      nodeUrl: "https://rpc.testnet.near.org",
      deps: {
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
      },
    };
    window.near = await nearApi.connect(config);

    console.log("window.near", window.near);

    const account = await window.near.account("adv1.liv1.testnet");
    const response = await account.state();
    console.log(response);

    const contract = new nearApi.Contract(
      account, // the account object that is connecting
      "adv1.liv1.testnet",
      {
        // name of contract you're connecting to
        viewMethods: ["get_adv_by_banner"], // view methods do not change state but usually return a value
        // changeMethods: [""], // change methods modify state
        // sender: account, // account object to initialize and sign transactions.
      }
    );

    const banner_uuid = curScriptElement.getAttribute("banner_uuid"); //1

    console.log("contract: ", contract, " banner_uuid : ", banner_uuid);
    let res = await contract.get_adv_by_banner({ banner_uuid: banner_uuid });
    res = JSON.parse(res);
    console.log("res: ", res);

    const img = document.createElement("img");
    if (res && parseInt(res.remaining_hit_count) > 0) {
      img.crossOrigin = "";
      img.src = res.adv_image_url;
      img.onclick = function () {
        location.href = res.adv_forwarding_url;
      };

      //   console.log(nearApi);
      // configure minimal network settings and key storage
    } else {
      img.src = "./embed.png";
    }

    document.body.appendChild(img);
    // ---------------------------------------------------------------------------
    // here you have access to `near-api-js` and a valid connection object `near`
    // ---------------------------------------------------------------------------
  })(window);
});
