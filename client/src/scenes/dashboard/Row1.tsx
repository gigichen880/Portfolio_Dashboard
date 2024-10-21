import BoxHeader from "@/components/BoxHeader";
import DashboardBox from "@/components/DashboardBox";
import { useGetKpisQuery, useGetCandlesQuery } from "@/state/api";
import { useTheme } from "@mui/material";
import { useMemo } from "react";
import React, { useEffect, useState } from "react";
import StockForm from "@/components/FieldSelection";

import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  AreaChart,
  BarChart,
  Bar,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  Line,
  Tooltip,
  Area,
} from "recharts";

import axios from "axios";

const Row1 = () => {
  const [candleStickData, setCandleStickData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const { palette } = useTheme();
  const { data } = useGetKpisQuery();

  const fetchCandlestickData = async (cData) => {
    setLoading(true);
    try {
      console.log(cData.from);
      console.log(cData.to);
      console.log(cData.numSpan);
      console.log(cData.timeSpan);
      console.log(cData.symbol);
      // Construct the URL with parameters based on user input
      const response = await axios.get(
        `http://localhost:1337/candle/${cData.symbol}`,
        {
          params: {
            // symbol: formData.symbol,
            from: cData.from,
            to: cData.to,
            numSpan: cData.numSpan,
            timeSpan: cData.timeSpan,
          },
        }
      );

      setCandleStickData(response.data); // Store the transformed data in state
    } catch (e) {
      alert("An error occurred while fetching data");
      console.error(e);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  const handleSubmit = (data) => {
    setFormData(data); // Save form data on submit
    fetchCandlestickData(data); // Call fetch function with the submitted data
  };
  const revenue = useMemo(() => {
    return (
      data &&
      data[0].monthlyData.map(({ month, revenue }) => {
        return {
          name: month.substring(0, 3),
          revenue: revenue,
        };
      })
    );
  }, [data]);

  const revenueExpenses = useMemo(() => {
    return (
      data &&
      data[0].monthlyData.map(({ month, revenue, expenses }) => {
        return {
          name: month.substring(0, 3),
          revenue: revenue,
          expenses: expenses,
        };
      })
    );
  }, [data]);

  const revenueProfit = useMemo(() => {
    return (
      data &&
      data[0].monthlyData.map(({ month, revenue, expenses }) => {
        return {
          name: month.substring(0, 3),
          revenue: revenue,
          profit: (revenue - expenses).toFixed(2),
        };
      })
    );
  }, [data]);

  return (
    <>
      <DashboardBox gridArea="a">
        <BoxHeader
          title="Revenue and Expenses"
          subtitle="top line represents revenue, bottom line represents expenses"
          sideText="+4%"
        />
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={candleStickData}>
            <CartesianGrid vertical={false} stroke={palette.grey[800]} />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />

            {/* Vertical lines for high-low */}
            <Bar
              dataKey="low"
              fillOpacity={0}
              shape={({ x, y, width, height, payload }) => {
                const highY = y - (payload.high - payload.low);
                const lowY = y;
                return (
                  <rect
                    x={x + width / 2 - 1}
                    y={highY}
                    width={2}
                    height={lowY - highY}
                    fill="black"
                  />
                );
              }}
            />

            <Bar
              dataKey="open"
              fillOpacity={0}
              shape={({ x, y, width, height, payload }) => {
                const openY =
                  payload.open > payload.close
                    ? y
                    : y - (payload.close - payload.open);
                const closeY =
                  payload.open > payload.close
                    ? y - (payload.open - payload.close)
                    : y;
                return (
                  <rect
                    x={x + width / 4}
                    y={openY}
                    width={width / 2}
                    height={Math.abs(closeY - openY)}
                    fill={payload.open > payload.close ? "red" : "green"}
                  />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </DashboardBox>

      <DashboardBox gridArea="b">
        {
          <BoxHeader
            title="Profit and Revenue"
            subtitle="top line represents revenue, bottom line represents expenses"
            sideText="+4%"
          />
        }
        <StockForm onSubmit={handleSubmit} />

        {
          <ResponsiveContainer width="100%" height="45%">
            <LineChart
              width={500}
              height={400}
              data={candleStickData}
              margin={{
                top: 20,
                right: 20,
                left: -10,
                bottom: 55,
              }}
            >
              <CartesianGrid vertical={false} stroke={palette.grey[800]} />
              <XAxis
                dataKey="time"
                tickLine={false}
                style={{ fontSize: "10px" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                style={{ fontSize: "10px" }}
              />
              <Tooltip />
              <Legend
                height={20}
                wrapperStyle={{
                  margin: "0 0 10px 0",
                }}
              />

              <Line type="monotone" dataKey="close" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        }
      </DashboardBox>

      <DashboardBox gridArea="c"></DashboardBox>
    </>
  );
};

export default Row1;
