import pandas as pd

def fetch_stock_symbols():
  url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
  tables = pd.read_html(url)
  df = tables[0]
  sp500_symbols = df['Symbol']
  # sp500_symbols.to_csv("sp500_syms.csv", index=False)
  return sp500_symbols
  
# symbols = fetch_stock_symbols()
# print(symbols)
# print(f"Fetched {len(symbols)} symbols.")

from datetime import datetime, timedelta

def get_historical_date_range():
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=3*365)).strftime('%Y-%m-%d')
    return start_date, end_date

start_date, end_date = get_historical_date_range()
print(f"Fetching data from {start_date} to {end_date}")


