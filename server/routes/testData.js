import axios from "axios";
import express from "express";

import KPI from "../models/KPI.js";

const router = express.Router();

router.get("/symbols", async (req, res) => {
  const symbols = req.query.symbol;
  const apiKey = "ZDp5hlgcxU3QMWGPuUAmU9EtVPSy9ELW";
  const from = req.query.from;
  const to = req.query.to;
  const numSpan = req.query.numSpan;
  const timeSpan = req.query.timeSpan;
  console.log(symbols);
  console.log(timeSpan);

  const testResult = async (symbols) => {
    const listOfResults = await Promise.all(
      symbols.map(async (element) => {
        const url = `https://api.polygon.io/v2/aggs/ticker/${element}/range/${numSpan}/${timeSpan}/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`;
        console.log(url);
        const result = (await axios.get(url)).data.results;

        function convertUnixToDate(unixMsec) {
          const date = new Date(unixMsec);
          const year = date.getFullYear().toString();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          return `${year}-${month}-${day}`;
        }

        const modified_res = result.map((el) => {
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

        return modified_res;
      })
    );

    return listOfResults;
  };

  try {
    async function getResults() {
      const results = await testResult(symbols);
      res.json(results);
    }
    getResults();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

export default router;
