import axios from "axios";
import express from "express";

import KPI from "../models/KPI.js";

const router = express.Router();

router.get("/AAPL", async (req, res) => {
  // const symbol = req.params.symbol;
  const symbol = "AAPL";
  const apiKey = "ZDp5hlgcxU3QMWGPuUAmU9EtVPSy9ELW";
  const from = "2023-01-09";
  const to = "2023-02-10";
  const numSpan = 1;
  const timeSpan = "day";
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${numSpan}/${timeSpan}/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`;
  const result = await axios.get(url);
  const mod_res = result.data.results;

  function convertUnixToDate(unixMsec) {
    const date = new Date(unixMsec);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const modified_res = mod_res.map((el) => {
    return {
      time: convertUnixToDate(el.t),
      high: el.h,
      low: el.l,
      close: el.c,
      open: el.o,
      numTx: el.n,
      volume: el.v,
      volWeightedAvgPrice: el.vw,
    };
  });
  try {
    console.log(mod_res);
    res.json(mod_res);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default router;
