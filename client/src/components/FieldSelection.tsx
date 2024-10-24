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
        <Box width="100%">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Input for adding new stock symbols */}
              <Grid item xs={8}>
                <TextField
                  label="Add Stock Symbol"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value)}
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

                <Button variant="contained" color="primary" onClick={addSymbol}>
                  Add
                </Button>
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
                      No symbols added
                    </Typography>
                  ) : (
                    symbol.map((symbol) => (
                      <Chip
                        key={symbol}
                        label={symbol}
                        onDelete={() => removeSymbol(symbol)}
                        style={{ marginBottom: "5px" }}
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
                  <button
                    variant="contained"
                    type="submit"
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: palette.primary.main,
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
    </FlexBetween>
  );
};

export default StockForm;
