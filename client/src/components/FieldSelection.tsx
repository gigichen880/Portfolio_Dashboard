import React, { useState } from "react";
import FlexBetween from "./FlexBetween";
import {
  Box,
  Typography,
  useTheme,
  Grid,
  Button,
  Chip,
  TextField,
} from "@mui/material";

const StockForm = ({ onSubmit }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [numSpan, setNumSpan] = useState("");
  const [timeSpan, setTimeSpan] = useState("day");
  const [symbol, setSymbol] = useState([]);
  const [symbolInput, setSymbolInput] = useState("");
  const [weight, setWeight] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [pair, setPair] = useState([]);

  // Function to handle adding new symbols
  const addSymbol = () => {
    let sym = null;
    let wei = null;
    if (symbolInput.trim() !== "" && !symbol.includes(symbolInput)) {
      setSymbol((prevSymbols) => [...prevSymbols, symbolInput]);
      sym = symbolInput;
      setSymbolInput(""); // Clear input after adding
    }
    if (!weight.includes(weightInput)) {
      setWeight((prevWeights) => [...prevWeights, weightInput]);
      wei = weightInput;
      setWeightInput(""); // Clear input after adding
    }

    if (sym !== null && wei !== null) {
      const currPair = [sym, wei];
      setPair((prevPairs) => [...prevPairs, currPair]);
    }
  };

  // Function to handle removing a symbol
  const removePair = (pairToRemove) => {
    setPair((prevPair) => prevPair.filter((pair) => pair !== pairToRemove));
    setSymbol((prevSymbol) =>
      prevSymbol.filter((symbol) => symbol !== pairToRemove[0])
    );
    setWeight((prevWeight) =>
      prevWeight.filter((weight) => weight !== pairToRemove[1])
    );
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      symbol,
      weight,
      from: fromDate,
      to: toDate,
      numSpan,
      timeSpan,
    };
    onSubmit(formData); // Pass the form data back to the parent component
  };

  const { palette } = useTheme();

  return (
    <FlexBetween color={palette.grey[400]} margin="1.5rem 1rem 0 1rem">
      <FlexBetween>
        <Box width="100%">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Input for adding new stock symbols */}
              <Grid item xs={8}>
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "10px",
                  }}
                >
                  <TextField
                    label="Stock Symbol"
                    value={symbolInput}
                    onChange={(e) => setSymbolInput(e.target.value)}
                    size="small"
                    style={{ marginLeft: "20px", marginRight: "10px" }}
                    color="#bfbfbf"
                    InputProps={{
                      style: {
                        color: "#bfbfbf", // Change input text color here
                      },
                    }}
                    InputLabelProps={{
                      style: {
                        color: "#bfbfbf", // Change label color here if needed
                      },
                    }}
                  />

                  <TextField
                    label="Number of Shares"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    size="small"
                    style={{ marginRight: "20px" }}
                    color="#bfbfbf"
                    InputProps={{
                      style: {
                        color: "#bfbfbf", // Change input text color here
                      },
                    }}
                    InputLabelProps={{
                      style: {
                        color: "#bfbfbf", // Change label color here if needed
                      },
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "10px",
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={addSymbol}
                    style={{
                      padding: "0.5rem 4rem",
                      backgroundColor: palette.primary.main,
                      width: "40px",
                      cursor: "pointer",
                      marginTop: "1rem",
                    }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>

              {/* Symbol list in a fixed column with scroll */}
              <Grid item xs={4}>
                <Box
                  width="100%"
                  style={{
                    minHeight: "110px", // Fixed height even if fewer than 4 symbols
                    maxHeight: "110px", // Maximum height before scroll appears
                    overflowY: "auto",
                    border: "1px solid #5d5656",
                    padding: "10px",
                  }}
                >
                  {symbol.length === 0 ? (
                    <Typography variant="body2" color="#bfbfbf">
                      No symbols yet
                    </Typography>
                  ) : (
                    pair.map((pair) => (
                      <Chip
                        key={pair}
                        label={`${pair[0]} (${pair[1]} shares)`}
                        onDelete={() => removePair(pair)}
                        style={{
                          marginBottom: "5px",
                          color: "white",
                          backgroundColor: "#3f51b5",
                        }}
                      />
                    ))
                  )}
                </Box>
              </Grid>

              {/* Form fields */}
              <Grid item xs={6}>
                <label>
                  From Date:
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                    style={{
                      backgroundColor: "#bfbfbf", // Light grey background
                      border: "1px solid #ccc", // Optional border color
                      width: "100%",
                      padding: "0.5rem",
                      marginTop: "0.25rem",
                    }}
                  />
                </label>
              </Grid>

              <Grid item xs={6}>
                <label>
                  To Date:
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                    style={{
                      backgroundColor: "#bfbfbf",
                      border: "1px solid #ccc",
                      width: "100%",
                      padding: "0.5rem",
                      marginTop: "0.25rem",
                    }}
                  />
                </label>
              </Grid>

              <Grid item xs={6}>
                <label>
                  Number Span:
                  <input
                    type="number"
                    value={numSpan}
                    onChange={(e) => setNumSpan(e.target.value)}
                    required
                    style={{
                      backgroundColor: "#bfbfbf",
                      border: "1px solid #ccc",
                      width: "100%",
                      padding: "0.5rem",
                      marginTop: "0.25rem",
                    }}
                  />
                </label>
              </Grid>

              <Grid item xs={6}>
                <label>
                  Time Span:
                  <select
                    value={timeSpan}
                    onChange={(e) => setTimeSpan(e.target.value)}
                    style={{
                      backgroundColor: "#bfbfbf",
                      border: "1px solid #ccc",
                      width: "100%",
                      padding: "0.5rem",
                      marginTop: "0.25rem",
                    }}
                  >
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </label>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                  <Button
                    variant="contained"
                    type="submit"
                    style={{
                      padding: "0.5rem 1.5rem",
                      backgroundColor: palette.primary.main,
                      border: "none",
                      cursor: "pointer",
                      marginTop: "1rem",
                    }}
                  >
                    Fetch Data
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </FlexBetween>
    </FlexBetween>
  );
};

export default StockForm;
