import pandas as pd

url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
tables = pd.read_html(url)
df = tables[0]
sp500_symbols = df['Symbol']
sp500_symbols.to_csv("sp500_syms.csv", index=False)

