/* "use strict";
 */

/**
 * References:
 * https://docs.near.org/docs/api/naj-quick-reference
 * https://docs.near.org/docs/develop/front-end/introduction#client-side
 */
import(
  "https://cdn.jsdelivr.net/npm/near-api-js@0.44.2/dist/near-api-js.js"
).then(() => {
  const img = document.createElement("img");
  img.src =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlXL7iUSNx3paSbh5VS6Oz3ceOFMBVOpEufA&usqp=CAU";
  document.body.appendChild(img);
  //   console.log(nearApi);
  // configure minimal network settings and key storage
  const config = {
    nodeUrl: "https://rpc.testnet.near.org",
    deps: {
      keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
    },
  };

  // open a connection to the NEAR platform
  (async function () {
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
        viewMethods: ["all_banner"], // view methods do not change state but usually return a value
        // changeMethods: [""], // change methods modify state
        // sender: account, // account object to initialize and sign transactions.
      }
    );

    console.log("contract: ", contract);
    const res = await contract.all_banner();
    console.log("res: ", res);

    // ---------------------------------------------------------------------------
    // here you have access to `near-api-js` and a valid connection object `near`
    // ---------------------------------------------------------------------------
  })(window);
});
