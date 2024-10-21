// StockForm.js
import React, { useState } from "react";

const StockForm = ({ onSubmit }) => {
  const [symbol, setSymbol] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [numSpan, setNumSpan] = useState("");
  const [timeSpan, setTimeSpan] = useState("");

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

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Stock Symbol:
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          From Date:
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          To Date:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Number Span:
          <input
            type="number"
            value={numSpan}
            onChange={(e) => setNumSpan(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Time Span:
          <select
            value={timeSpan}
            onChange={(e) => setTimeSpan(e.target.value)}
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </label>
      </div>
      <button type="submit">Fetch Data</button>
    </form>
  );
};

export default StockForm;
