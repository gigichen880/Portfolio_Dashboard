import axios from "axios";

const fetchStockData = async () => {
  const apiKey = "ZDp5hlgcxU3QMWGPuUAmU9EtVPSy9ELW";
  const symbol = "AAPL";
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/2023-01-09/2023-02-10?adjusted=true&sort=asc&apiKey=${apiKey}`;

  //   try {
  //     const response = await axios.get(url);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error("Error fetching data from Alpha Vantage:", error);
  //   }
  // };

  // fetchStockData();

  try {
    // Fetch stock data using yfinance
    const result = await axios.get(url);
    console.log("what");
    console.log(result.data);
  } catch (error) {
    console.error("Error fetching data from Yahoo Finance:", error);
  }
};
fetchStockData();
