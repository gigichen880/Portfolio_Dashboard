import pandas as pd
from datetime import datetime, timedelta
import yfinance as yf
import aiohttp
import asyncio


def fetch_stock_symbols():
  url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
  tables = pd.read_html(url)
  df = tables[0]
  sp500_symbols = df['Symbol']
  # sp500_symbols.to_csv("sp500_syms.csv", index=False)
  return sp500_symbols
  
# print(symbols)
# print(f"Fetched {len(symbols)} symbols.")

def get_historical_date_range(nod):
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=nod)).strftime('%Y-%m-%d')
    return start_date, end_date

def fetch_and_preprocess(symbol, start_date, end_date):
    ticker = yf.Ticker(symbol)
    df = ticker.history(start=start_date, end=end_date) 
    df.reset_index(inplace=True)

    # Prepare for time-series stock information
    time_series = []
    for _, row in df.iterrows():
        time_series.append({
            "date": row["Date"].strftime("%Y-%m-%d"),
            "open": row["Open"],
            "high": row["High"],
            "low": row["Low"],
            "close": row["Close"],
            "volume": row["Volume"],
        })

    # Create a stock document
    stock_document = {
        "symbol": symbol,
        "name": ticker.info.get("longName", "Unknown"),  
        "sector": ticker.info.get("sector", "Unknown"),  
        "industry": ticker.info.get("industry", "Unknown"),  
        "timeSeries": time_series,
        "lastUpdated": datetime.now().isoformat(),
    }

    return stock_document


import asyncio
from datetime import datetime
from pymongo import MongoClient

client = MongoClient("mongodb+srv://breechen88:Bree20058874824*@findash.lb1gi.mongodb.net/?retryWrites=true&w=majority&appName=FinDash")

db = client.get_database("FinDash")
stock_collection = db["stocks"]

async def save_db(symbol, nod):
    start_date, end_date = get_historical_date_range(nod)
    print(f"Fetching data from {start_date} to {end_date}")
    stock_data = fetch_and_preprocess(symbol, start_date, end_date)
    
    # Check if the stock document already exists in the database
    existing_stock = stock_collection.find_one({"symbol": symbol})

    if not existing_stock:
        # No record exists: Insert the new stock data
        new_stock = {
            "symbol": symbol,
            "name": stock_data.get("name"),
            "sector": stock_data.get("sector"),
            "industry": stock_data.get("industry"),
            "timeSeries": stock_data["timeSeries"],
            "lastUpdated": datetime.now()
        }
        result = stock_collection.insert_one(new_stock)
        print("Stock data inserted successfully:", new_stock)

    else:
        # Record exists: Merge and de-duplicate time series
        existing_data = existing_stock["timeSeries"]
        new_data = stock_data["timeSeries"]

        # Combine and filter out duplicates based on date
        combined_data = existing_data + [
            entry for entry in new_data if entry not in existing_data
        ]

        # Sort by date (timestamp)
        combined_data.sort(key=lambda x: datetime.strptime(x["date"], "%Y-%m-%d"))

        # Update the existing stock document with the merged time series
        stock_collection.update_one(
            {"_id": existing_stock["_id"]},
            {
                "$set": {
                    "timeSeries": combined_data,
                    "lastUpdated": datetime.now()
                }
            }
        )
        print("Stock data updated successfully:", existing_stock["symbol"])



async def main():
    symbols = fetch_stock_symbols()
    num_of_year = 3
    num_of_month = 2
    nod = num_of_year * 365
    # nod = num_of_month * 30
    # await save_db("MSFT", nod)
    for symbol in symbols:
      await save_db(symbol, nod)

if __name__ == "__main__":
    asyncio.run(main())