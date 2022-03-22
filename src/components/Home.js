import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

export const Home = ({}) => {
  const history = useHistory();
  const redirectToPage = (path) => {
    if (path === "embed.html") {
      window.location.href = window.location.pathname + path;
    } else {
      history.push(window.location.pathname + path);
    }
  };
  return (
    <>
      <button
        onClick={() => redirectToPage("market-place")}
        className="button-19"
      >
        Market Place
      </button>
      <button onClick={() => redirectToPage("publisher")} className="button-19">
        Publisher
      </button>
      <button onClick={() => redirectToPage("mint")} className="button-19">
        Mint Banner
      </button>
      <button
        onClick={() => redirectToPage("embed.html")}
        className="button-19"
      >
        Banner Demo
      </button>
    </>
  );
};
