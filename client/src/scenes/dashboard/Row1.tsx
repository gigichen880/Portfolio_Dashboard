import BoxHeader from "@/components/BoxHeader";
import DashboardBox from "@/components/DashboardBox";
import { useGetKpisQuery } from "@/state/api";
import { useTheme, Typography } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import StockForm from "@/components/FieldSelection";
import {
  ResponsiveContainer,
  LineChart,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Legend,
  Line,
  Label,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import axios from "axios";
import { isButtonElement } from "react-router-dom/dist/dom";

const Row1 = () => {
  const [candleStickData, setCandleStickData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);
  const [userInputFields, setUserInputFields] = useState(null);
  const { palette } = useTheme();
  const { data } = useGetKpisQuery();
  const [symbolList, setSymbolList] = useState([]);
  const [closeArr, setCloseArr] = useState([]);
  const [retArr, setRetArr] = useState([]);
  const [dates, setDates] = useState([]);
  const [weights, setWeights] = useState([]);
  const [numData, setNumData] = useState();
  const [portfolioRets, setPortfolioRets] = useState([]);
  const [portfolioRisk, setPortfolioRisk] = useState(null);
  const [optimPortRets, setOptimPortRets] = useState(null);
  const [optimPortRisk, setOptimPortRisk] = useState(null);
  const [weightPercent, setWeightPercent] = useState([]);
  const [optimizedWeights, setOptimizedWeights] = useState(null);
  const [mcRisks, setMcRisks] = useState(null);
  const [mcReturns, setMcReturns] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [mcRetRisk, setMcRetRisk] = useState(null);
  const [ceilings, setCeilings] = useState([]);
  const [renderOptimLine, setRenderOptimLine] = useState(false);
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
      const params = {
        from: cData.from,
        to: cData.to,
        numSpan: cData.numSpan,
        timeSpan: cData.timeSpan,
        symbol: cData.symbol,
      };
      // Construct the URL with parameters based on user input
      const response = await axios.get(`http://localhost:1337/candle/symbols`, {
        params: params,
      });
      setWeights(cData.weight);
      setCandleStickData(response.data);
      setUserInputFields(params);
    } catch (e) {
      alert("An error occurred while fetching data");
      console.error(e);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  const handleOptimize = async () => {
    try {
      console.log("Enter Optim", symbolList);
      const response = await axios.post("http://localhost:1337/api/optimize", {
        symbols: symbolList,
      });
      console.log("Response?", response);
      setOptimizedWeights(response.data.weights);
      setMcReturns(response.data.returns);
      setMcRisks(response.data.risks);
      const data = response.data.risks.map((risk, index) => ({
        risk: risk,
        return: response.data.returns[index],
      }));
      setMcRetRisk(data);
      console.log("DATA?", mcRetRisk);
      // setImageData(`data:image/png;base64,${response.data.image}`);
    } catch (error) {
      console.error("Error fetching optimized portfolio:", error);
    }
  };

  const getReturn = (arr) => {
    return arr
      .map((value, index) => {
        if (index === 0) return 0; // or any other value for the first element
        return (value - arr[index - 1]) / arr[index - 1];
      })
      .slice(1); // Remove the first element
  };

  const getPortfolioRet = (returnVals, weightVals, isOptim) => {
    let retPortArr = [];
    const totalShares = weightVals.reduce((acc, val) => acc + Number(val), 0);
    console.log("SRC!", weightVals);
    const alloc = weightVals.map((weight) => weight / totalShares);
    if (!isOptim) {
      setWeightPercent(alloc);
      console.log("Hey!", weightVals);
    }

    for (let time = 1; time !== numData + 1; time++) {
      let retNow = 0;
      for (let sym = 0; sym !== symbolList.length; sym++) {
        retNow += returnVals[sym][time] * alloc[sym];
      }
      retPortArr.push(retNow);
    }
    if (!isOptim) {
      setPortfolioRets(retPortArr.slice(0, -1));
      getPortfolioRisk(false);
    } else {
      setOptimPortRets(retPortArr.slice(0, -1));
      getPortfolioRisk(true);
    }
  };

  const getPortfolioRisk = (isOptim) => {
    if (portfolioRets.length > 0) {
      const avgReturn =
        portfolioRets.reduce((acc, val) => acc + val, 0) / numData;
      const portRisk =
        Math.sqrt(
          portfolioRets
            .map((ret) => (ret - avgReturn) ** 2)
            .reduce((acc, val) => acc + val, 0)
        ) /
        (numData - 1);
      console.log("SHHH");
      console.log(avgReturn);
      console.log(portfolioRets);
      if (!isOptim) {
        setPortfolioRisk(portRisk);
      } else {
        setOptimPortRisk(portRisk);
      }
    }
  };

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

  useEffect(() => {
    if (candleStickData.length > 0) {
      const mergedData = mergeDatasets(candleStickData);
      const numOfData = mergedData.length;
      setNumData(numOfData);

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
    }
  }, [candleStickData]); // Depend on candleStickData
  console.log("rets", portfolioRets);
  console.log("optimw", optimizedWeights);
  useEffect(() => {
    if (retArr.length > 0 && weights.length > 0 && numData) {
      console.log("Lets", weights);
      getPortfolioRet(retArr, weights, false);
      if (optimizedWeights != null) {
        getPortfolioRet(retArr, optimizedWeights, true);
      }
    }
  }, [retArr, weights, numData, optimizedWeights]);

  // useEffect(() => {
  //   getPortfolioRisk(); // Call this whenever portfolioRets updates
  // }, [portfolioRets, numData, weights]); // Add necessary dependencies

  // const handleSubmit = (data) => {
  //   setFormData(data); // Save form data on submit
  //   fetchCandlestickData(data); // Call fetch function with the submitted data
  //   // handleOptimize();
  // };
  // console.log(handleSubmit); // Should log the function
  const handleSubmit = useCallback(
    (data) => {
      setFormData(data);
      fetchCandlestickData(data);
    },
    [setFormData, fetchCandlestickData]
  );

  const handleOptimBtn = () => {
    setRenderOptimLine(true);
    handleOptimize();
    console.log("Vuala!");
  };

  useEffect(() => {
    if (symbolList.length > 0) {
      handleOptimize();
    }
  }, [symbolList]); // This triggers when symbolList is updated

  const MultiLineChart = ({
    stockReturns,
    dates,
    portfolioRets,
    optimPortRets,
  }) => {
    // Transform the returns into a format usable by Recharts
    console.log(portfolioRisk);
    const transformedData = dates.map((date, index) => {
      const result = { name: date };
      stockReturns.forEach((stock) => {
        result[stock[0]] = stock[index + 1]; // +1 because the first element is the stock name
      });
      result["Portfolio"] = portfolioRets[index];
      if (optimPortRets != null) {
        result["Optim"] = optimPortRets[index];
      }
      return result;
    });

    return (
      <ResponsiveContainer width="97%" height="90%">
        <LineChart data={transformedData}>
          {transformedData.length > 0 && (
            <CartesianGrid strokeDasharray="5 5" />
          )}
          <XAxis dataKey="name" />
          <YAxis />
          <Label
            value={`Risk: ${portfolioRisk}`} // Display risk value
            angle={-90}
            position="insideLeft"
            offset={30}
            style={{ textAnchor: "middle", fontSize: "14px", fill: "black" }}
          />

          <Tooltip formatter={(value) => value.toFixed(4)} />
          <Legend />
          {/* {!renderOptimLine &&
            stockReturns.map((stock) => (
              <Line
                key={stock[0]} // Use the stock symbol for the key
                type="monotone"
                dataKey={stock[0]} // Use the stock symbol as the dataKey
                stroke={getLineColor(stockReturns.indexOf(stock))}
                activeDot={{ r: 8 }}
              />
            ))} */}

          {stockReturns.map((stock) => (
            <Line
              key={stock[0]} // Use the stock symbol for the key
              type="monotone"
              dataKey={stock[0]} // Use the stock symbol as the dataKey
              stroke={getLineColor(stockReturns.indexOf(stock))}
              activeDot={{ r: 8 }}
            />
          ))}
          {transformedData.length > 0 && (
            <Line
              type="monotone"
              dataKey="Portfolio"
              stroke="#acb89b" // Black color for the portfolio line
              activeDot={{ r: 8 }}
              strokeWidth={3}
            />
          )}
          {renderOptimLine && (
            <Line
              type="monotone"
              dataKey="Optim"
              stroke="#d3113e" // Black color for the portfolio line
              activeDot={{ r: 8 }}
              strokeWidth={3}
            />
          )}
        </LineChart>
        {/* <div style={{ color: "black" }}>Risk: {portfolioRisk}</div> */}
      </ResponsiveContainer>
    );
  };
  const PortfolioPieChart = ({ portfolioWeights }) => {
    // Define colors for each segment
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
    console.log(weightPercent);
    console.log(portfolioWeights);
    return (
      // <ResponsiveContainer width="97%" height="90%">
      <PieChart width={400} height={400} cx="50%" cy="50%">
        <Pie
          data={portfolioWeights}
          dataKey="weight"
          nameKey="stock"
          cx="50%"
          cy="50%"
          outerRadius={150}
          label
        >
          {portfolioWeights.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      // </ResponsiveContainer>
    );
  };
  const portfolioWeights = symbolList.map((symbol, idx) => ({
    stock: symbol,
    weight: parseFloat((weightPercent[idx] ?? 0).toFixed(4)),
  }));

  console.log("test weights", weightPercent);

  useEffect(() => {
    if (mcRetRisk != null) {
      const data = mcRetRisk;
      const risks = data.map((d) => d.risk);
      const returns = data.map((d) => d.return);
      const minRisk = Math.min(...risks);
      const maxRisk = Math.max(...risks);
      const minReturn = Math.min(...returns);
      const maxReturn = Math.max(...returns);

      setCeilings([
        Math.floor(minRisk * 10) / 10, // Round down for a tighter view
        Math.ceil(maxRisk * 10) / 10, // Round up to give space
        Math.floor(minReturn * 10) / 10,
        Math.ceil(maxReturn * 10) / 10,
      ]);
    }
  }, [mcRetRisk]); // This triggers when symbolList is updated

  const ReturnVsRiskScatterPlot = (ceilings) => (
    <ResponsiveContainer width={1200} height={300}>
      <ScatterChart>
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="risk"
          name="Risk"
          domain={[ceilings[0], ceilings[1]]}
          unit="%"
          label={{ value: "Risk (%)", position: "insideBottom", offset: -5 }}
        />
        <YAxis
          type="number"
          dataKey="return"
          name="Return"
          domain={[ceilings[2], ceilings[3]]}
          unit="%"
          label={{ value: "Return (%)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          formatter={(value) => value.toFixed(4)} // Format values to 4 decimal places
        />
        <Scatter name="Portfolio" data={mcRetRisk} fill="#82ca9d" />
      </ScatterChart>
    </ResponsiveContainer>
  );
  return (
    <>
      <DashboardBox gridArea="a">
        <BoxHeader title="Exploration" subtitle="Customize your portfolio" />
        <ResponsiveContainer width="100%" height={300}>
          <StockForm
            handleFormSubmit={handleSubmit}
            ifGetOptim={optimizedWeights}
            isOptimBtn={handleOptimBtn}
          />
        </ResponsiveContainer>
      </DashboardBox>

      <DashboardBox gridArea="b">
        <BoxHeader
          title="Daily Return Rates"
          subtitle="Multiple stock symbols displayed together"
          sideText={`Portfolio Risk: ${
            portfolioRisk ? (portfolioRisk * 100).toFixed(4) : "N/A"
          }%`}
        />
        <ResponsiveContainer width="100%" height="100%">
          <MultiLineChart
            stockReturns={retArr}
            dates={dates.slice(1)}
            portfolioRets={portfolioRets}
            optimPortRets={optimPortRets}
          />
        </ResponsiveContainer>
      </DashboardBox>

      <DashboardBox gridArea="c">
        <ResponsiveContainer width="100%" height="100%">
          <BoxHeader
            title="Portfolio Composition"
            subtitle="Customize your portfolio"
          />
          <PortfolioPieChart portfolioWeights={portfolioWeights} />
        </ResponsiveContainer>
      </DashboardBox>

      <DashboardBox gridArea="d">
        <BoxHeader
          title="Monte Carlo Sampling"
          subtitle="Return-Risk Over Sampled Portfolio Weights"
        />
        <div
          style={{
            width: "100%",
            maxHeight: "100px",
            overflowY: "auto",
            padding: "0.5rem",
            borderRadius: "5px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h5"
            style={{ marginBottom: "-0.1rem", marginLeft: "0.5rem" }}
          >
            {"Optimized Weights"}
          </Typography>
          <Typography
            variant="h6"
            style={{ marginBottom: "-0.1rem", marginLeft: "0.5rem" }}
          >
            {optimizedWeights ? (
              <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
                {optimizedWeights.map((weight, index) => (
                  <li key={index}>
                    Stock {symbolList[index]}: {weight.toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Loading optimized weights...</p>
            )}
          </Typography>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "70%",
          }}
        >
          <ReturnVsRiskScatterPlot ceilings={ceilings} />
        </div>
      </DashboardBox>

      <DashboardBox gridArea="e"></DashboardBox>
      <DashboardBox gridArea="f"></DashboardBox>

      {/* <DashboardBox gridArea="c"></DashboardBox> */}
    </>
  );
};

export default Row1;
