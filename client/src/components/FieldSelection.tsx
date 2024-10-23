// StockForm.js
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

  // Function to handle adding new symbols
  const addSymbol = () => {
    if (symbolInput.trim() !== "" && !symbol.includes(symbolInput)) {
      setSymbol((prevSymbols) => [...prevSymbols, symbolInput]);
      setSymbolInput(""); // Clear input after adding
    }
  };

  // Function to handle removing a symbol
  const removeSymbol = (symbolToRemove) => {
    setSymbol((prevSymbols) =>
      prevSymbols.filter((symbol) => symbol !== symbolToRemove)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(symbol);
    const formData = {
      symbol,
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
        <form onSubmit={handleSubmit}></form>

        <Box width="100%">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Input for adding new stock symbols */}
              <TextField
                color="#f8f8f8"
                label="Add Stock Symbol"
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value)}
                size="small"
                style={{ marginRight: "10px", color: "#ccc" }}
              />
              <Button variant="contained" color="primary" onClick={addSymbol}>
                Add
              </Button>

              {/* Render the list of symbols as chips/tags */}
              <Box style={{ marginTop: "10px" }}>
                {symbol.map((symbol) => (
                  <Chip
                    key={symbol}
                    label={symbol}
                    onDelete={() => removeSymbol(symbol)}
                    style={{ marginRight: "5px", marginBottom: "5px" }}
                  />
                ))}
              </Box>

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
                      color: "#333",
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
                      backgroundColor: "#bfbfbf", // Light grey background
                      border: "1px solid #ccc", // Optional border color
                      color: "#333",
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
                      backgroundColor: "#bfbfbf", // Light grey background
                      border: "1px solid #ccc", // Optional border color
                      color: "#333",
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
                      backgroundColor: "#bfbfbf", // Light grey background
                      border: "1px solid #ccc", // Optional border color
                      color: "#333",
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
                  <button
                    type="submit"
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: palette.primary.main,
                      color: "#0a0a0a",
                      border: "none",
                      cursor: "pointer",
                      marginTop: "1rem",
                    }}
                  >
                    Fetch Data
                  </button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </FlexBetween>

      <Typography variant="h5" fontWeight="700" color={palette.secondary[500]}>
        {/* You can add text here if needed */}
      </Typography>
    </FlexBetween>
  );
};

export default StockForm;
