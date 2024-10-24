import BoxHeader from "@/components/BoxHeader";
import DashboardBox from "@/components/DashboardBox";
import { useGetKpisQuery } from "@/state/api";
import { useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import StockForm from "@/components/FieldSelection";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  Line,
  Tooltip,
  CartesianGrid,
} from "recharts";
import axios from "axios";

const Row1 = () => {
  const [candleStickData, setCandleStickData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const { palette } = useTheme();
  const { data } = useGetKpisQuery();
  const [symbolList, setSymbolList] = useState([]);
  const [closeArr, setCloseArr] = useState([]);
  const [retArr, setRetArr] = useState([]);
  const [dates, setDates] = useState([]);
  const getLineColor = (index) => {
    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ff7300",
      "#ff0000",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
      "#0088FE",
      "#FFBB28",
      "#FF0000",
    ];
    return colors[index % colors.length];
  };

  const fetchCandlestickData = async (cData) => {
    setLoading(true);
    try {
      console.log(
        cData.from,
        cData.to,
        cData.numSpan,
        cData.timeSpan,
        cData.symbol
      );
      setSymbolList(cData.symbol);
      // Construct the URL with parameters based on user input
      const response = await axios.get(`http://localhost:1337/candle/symbols`, {
        params: {
          from: cData.from,
          to: cData.to,
          numSpan: cData.numSpan,
          timeSpan: cData.timeSpan,
          symbol: cData.symbol,
        },
      });

      setCandleStickData(response.data);
    } catch (e) {
      alert("An error occurred while fetching data");
      console.error(e);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  function getReturn(arr) {
    return arr
      .map((value, index) => {
        if (index === 0) return 0; // or any other value for the first element
        return (value - arr[index - 1]) / arr[index - 1];
      })
      .slice(1); // Remove the first element
  }

  const mergeDatasets = (datasets) => {
    const mergedData = {};
    datasets.forEach((dataset, datasetIndex) => {
      dataset.forEach((item) => {
        const time = item.time;
        if (!mergedData[time]) {
          mergedData[time] = { time };
        }
        mergedData[time][`close_${datasetIndex}`] = item.volWeightedAvgPrice; // Store each symbol's close price with a unique key
      });
    });
    return Object.values(mergedData);
  };

  const getSymName = (index) => {
    return symbolList[index];
  };

  // This useEffect will run when candleStickData changes
  useEffect(() => {
    const mergedData = mergeDatasets(candleStickData);
    const numOfData = mergedData.length;

    const numberOfLines = candleStickData.length;
    setDates(mergedData.map((data) => data.time)); // Set dates based on merged data

    let tmpArr = [];
    let tmpRet = [];
    for (let i = 0; i < numberOfLines; i++) {
      let thisSym = [getSymName(i)];
      for (let t = 0; t < numOfData; t++) {
        let datum = mergedData[t][`close_${i}`];
        thisSym.push(datum);
      }
      tmpArr.push(thisSym);

      // Calculate returns and keep the stock name as the first element
      let thisRet = [getSymName(i), ...getReturn(thisSym.slice(1))];
      tmpRet.push(thisRet);
    }

    setCloseArr(tmpArr);
    setRetArr(tmpRet);
  }, [candleStickData]); // Depend on candleStickData

  console.log(retArr);

  const handleSubmit = (data) => {
    setFormData(data); // Save form data on submit
    fetchCandlestickData(data); // Call fetch function with the submitted data
  };

  const MultiLineChart = ({ stockReturns, dates }) => {
    // Transform the returns into a format usable by Recharts
    const transformedData = dates.map((date, index) => {
      const result = { name: date };
      stockReturns.forEach((stock) => {
        result[stock[0]] = stock[index + 1]; // +1 because the first element is the stock name
      });
      return result;
    });

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {stockReturns.map((stock) => (
            <Line
              key={stock[0]} // Use the stock symbol for the key
              type="monotone"
              dataKey={stock[0]} // Use the stock symbol as the dataKey
              stroke={getLineColor(stockReturns.indexOf(stock))}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <>
      <DashboardBox gridArea="a">
        <BoxHeader title="Exploration" subtitle="Customize your portfolio" />
        <ResponsiveContainer width="100%" height={300}>
          <StockForm onSubmit={handleSubmit} />
        </ResponsiveContainer>
      </DashboardBox>

      <DashboardBox gridArea="b">
        <BoxHeader
          title="Daily Return Rates"
          subtitle="Multiple stock symbols displayed together"
          sideText="+4%"
        />
        <ResponsiveContainer width="100%" height="100%">
          <MultiLineChart stockReturns={retArr} dates={dates.slice(1)} />
        </ResponsiveContainer>
      </DashboardBox>

      <DashboardBox gridArea="c"></DashboardBox>
    </>
  );
};

export default Row1;
