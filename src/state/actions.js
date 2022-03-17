import BN from "bn.js";
import { GAS, parseNearAmount, marketId, contractId } from "../state/near";

export const handleMint = async (
  account,
  royalties,
  media,
  validMedia,
  bannerObj
) => {
  if (!media.length || !validMedia) {
    alert("Please enter a valid Image Link. You should see a preview below!");
    return;
  }

  // shape royalties data for minting and check max is < 20%
  let perpetual_royalties = Object.entries(royalties)
    .map(([receiver, royalty]) => ({
      [receiver]: royalty * 100,
    }))
    .reduce((acc, cur) => Object.assign(acc, cur), {});
  if (Object.values(perpetual_royalties).reduce((a, c) => a + c, 0) > 2000) {
    return alert(
      "Cannot add more than 20% in perpetual NFT royalties when minting"
    );
  }

  const metadata = {
    media,
    bannerObj,
    issued_at: parseInt(Date.now().toString()),
  };
  const deposit = parseNearAmount("10_000_000_000_000_000_000_000_000");

  const tokenId = "token-" + Date.now();

  await account.functionCall(
    contractId,
    "add_banner",
    {
      banner_uuid: tokenId,
      banner_page_url: bannerObj.URL,
      banner_width: bannerObj.width,
      banner_height: bannerObj.height,
      banner_subscription_charge: bannerObj.subscription.toString(),
    },
    GAS
    // deposit
  );

  /*await account.functionCall(
    contractId,
    "nft_mint",
    {
      token_id: tokenId,
      metadata,
      perpetual_royalties,
    },
    GAS,
    deposit
  );*/

  return tokenId;
};

export const handleSubscribe = async (
  account,
  bannerUuid,
  advImageUrl,
  advForwardingUrl,
  subscriptionCharge
) => {
  const adv_id = "adv-" + bannerUuid;
  const deposit = parseNearAmount(subscriptionCharge);
  await account.functionCall(
    contractId,
    "add_adv",
    {
      adv_id: adv_id,
      banner_uuid: bannerUuid,
      /* adv_image_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlXL7iUSNx3paSbh5VS6Oz3ceOFMBVOpEufA&usqp=CAU",
      adv_forwarding_url: "https://google.com/", */
      adv_image_url: advImageUrl,
      adv_forwarding_url: advForwardingUrl,
    },
    GAS,
    deposit
  );
};

export const handleAcceptOffer = async (account, token_id, ft_token_id) => {
  if (ft_token_id !== "near") {
    return alert("currently only accepting NEAR offers");
  }
  await account.functionCall(
    marketId,
    "accept_offer",
    {
      nft_contract_id: contractId,
      token_id,
      ft_token_id,
    },
    GAS
  );
};

export const handleRegisterStorage = async (account) => {
  // WARNING this just pays for 10 "spots" to sell NFTs in marketplace vs. paying each time
  await account.functionCall(
    marketId,
    "storage_deposit",
    {},
    GAS,
    new BN(await account.viewFunction(marketId, "storage_amount", {}, GAS)).mul(
      new BN("10")
    )
  );
};

export const handleSaleUpdate = async (
  account,
  token_id,
  newSaleConditions
) => {
  const sale = await account
    .viewFunction(marketId, "get_sale", {
      nft_contract_token: contractId + ":" + token_id,
    })
    .catch(() => {});
  if (sale) {
    await account.functionCall(
      marketId,
      "update_price",
      {
        nft_contract_id: contractId,
        token_id,
        ft_token_id: newSaleConditions[0].ft_token_id,
        price: newSaleConditions[0].price,
      },
      GAS
    );
  } else {
    await account.functionCall(
      contractId,
      "nft_approve",
      {
        token_id,
        account_id: marketId,
        msg: JSON.stringify({ sale_conditions: newSaleConditions }),
      },
      GAS,
      parseNearAmount("0.01")
    );
  }
};
