// StockForm.js
import React, { useState } from "react";
import FlexBetween from "./FlexBetween";
import { Box, Typography, useTheme, Grid } from "@mui/material";

const StockForm = ({ onSubmit }) => {
  const [symbol, setSymbol] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [numSpan, setNumSpan] = useState("");
  const [timeSpan, setTimeSpan] = useState("day");

  const handleSubmit = (e) => {
    e.preventDefault();
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
              <Grid item xs={12}>
                <label>
                  Stock Symbol:
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
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
                      color: "#fff",
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
