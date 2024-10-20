import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  GetKpisResponse,
  GetProductsResponse,
  GetTransactionsResponse,
  GetCandleResponse,
} from "./types";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:1337" }),
  reducerPath: "main",
  tagTypes: ["Candles", "Kpis", "Products", "Transactions"],
  endpoints: (build) => ({
    getCandles: build.query<Array<GetCandleResponse>, void>({
      query: () => "candle/AAPL",
      providesTags: ["Candles"],
    }),
    getKpis: build.query<Array<GetKpisResponse>, void>({
      query: () => "kpi/kpis/",
      providesTags: ["Kpis"],
    }),
    getProducts: build.query<Array<GetProductsResponse>, void>({
      query: () => "product/products/",
      providesTags: ["Products"],
    }),
    getTransactions: build.query<Array<GetTransactionsResponse>, void>({
      query: () => "transaction/transactions/",
      providesTags: ["Transactions"],
    }),
  }),
});

export const {
  useGetCandlesQuery,
  useGetKpisQuery,
  useGetProductsQuery,
  useGetTransactionsQuery,
} = api;
