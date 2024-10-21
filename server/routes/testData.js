import axios from "axios";
import express from "express";

import KPI from "../models/KPI.js";

const router = express.Router();

router.get("/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const apiKey = "ZDp5hlgcxU3QMWGPuUAmU9EtVPSy9ELW";
  const from = req.query.from;
  const to = req.query.to;
  const numSpan = req.query.numSpan;
  const timeSpan = req.query.timeSpan;
  console.log(to);
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
    res.json(modified_res);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default router;
