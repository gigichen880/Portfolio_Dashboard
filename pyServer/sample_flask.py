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

async def save_db(nod):
    start_date, end_date = get_historical_date_range(nod)
    print(f"Fetching data from {start_date} to {end_date}")
    stock_data = fetch_and_preprocess("AAPL", start_date, end_date)
    print(stock_data)
    async with aiohttp.ClientSession() as session:
        url = "http://localhost:1337/api/savestock"
        async with session.post(url, json=stock_data) as response:
            if response.status == 200:
                response_data = await response.json()
                print("Successfully update database. Response data:", response_data)
            else:
                print(f"Failed to save stocks to database. Status code: {response.status}")

async def main():
    symbols = fetch_stock_symbols()
    num_of_year = 3
    num_of_month = 1
    nod = num_of_month * 30
    await save_db(nod)

if __name__ == "__main__":
    asyncio.run(main())