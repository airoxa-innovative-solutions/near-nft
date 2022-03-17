import React, { useEffect, useState } from "react";

import { handleSubscribe } from "../state/actions";
export const SubscribeBanner = ({
  account,
  banner_uuid,
  banner_subscription_charge,
}) => {
  const [advImageUrl, setAdvImageUrl] = useState("");
  const [advForwardingUrl, setAdvForwardingUrl] = useState("");

  return (
    <>
      <input
        className="full-width"
        placeholder="Advertisement image URL"
        value={advImageUrl}
        onChange={(e) => setAdvImageUrl(e.target.value)}
      />
      <input
        className="full-width"
        placeholder="Advertisement forwarding URL"
        value={advForwardingUrl}
        onChange={(e) => setAdvForwardingUrl(e.target.value)}
      />
      <button
        onClick={() =>
          handleSubscribe(
            account,
            banner_uuid,
            advImageUrl,
            advForwardingUrl,
            banner_subscription_charge
          )
        }
      >
        Subscribe
      </button>
    </>
  );
};
