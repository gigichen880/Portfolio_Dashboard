// api.js
import axios from "axios";

export const fetchCandlestickData = async (params) => {
  return axios.get(`http://localhost:1337/candle/symbols`, { params });
};

export const fetchOptimizedPortfolio = async (symbols) => {
  return axios.post(`http://localhost:1337/api/optimize`, { symbols });
};
