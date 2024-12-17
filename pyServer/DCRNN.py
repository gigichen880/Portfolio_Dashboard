import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GCNConv
import torch.optim as optim
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

class DiffusionGraphConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(DiffusionGraphConv, self).__init__()
        self.conv1 = GCNConv(in_channels, out_channels)
        self.conv2 = GCNConv(in_channels, out_channels)

    def forward(self, x, edge_index):
        # Forward and backward diffusion
        out = self.conv1(x, edge_index) + self.conv2(x, edge_index)
        return F.relu(out)

class DCRNNCell(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super(DCRNNCell, self).__init__()
        self.graph_conv = DiffusionGraphConv(input_dim, hidden_dim)
        self.gru = nn.GRUCell(hidden_dim, hidden_dim)
        self.bn = nn.BatchNorm1d(hidden_dim)

    def forward(self, x, edge_index, h):
        x = self.graph_conv(x, edge_index)  # x shape: [T, N, hidden_dim]
        h_new = []
        for t in range(x.size(0)):
            h_t = self.gru(x[t], h) 
            h_t = self.bn(h_t)
            h_new.append(h_t)
        h_new = torch.stack(h_new, dim=0)

        return h_new

class DCRNN(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, num_layers):
        super(DCRNN, self).__init__()
        self.num_layers = num_layers
        self.hidden_dim = hidden_dim
        self.cells = nn.ModuleList([DCRNNCell(input_dim if i == 0 else hidden_dim, hidden_dim) for i in range(num_layers)])
        self.fc = nn.Linear(hidden_dim, output_dim)

    def forward(self, x, edge_index, h=None):
        N = x.size(1)  # Number of nodes (batch size)
        
        if h is None:
            # Initialize hidden state with shape [N, hidden_dim] for each layer
            h = [torch.zeros(N, self.hidden_dim).to(x.device) for _ in range(self.num_layers)]
        
        for i, cell in enumerate(self.cells):
            h[i] = cell(x, edge_index, h[i])
            x = h[i]  # Pass output as input to the next layer
        out = self.fc(x)
        return out, h

import yfinance as yf
import pandas as pd

start_date, end_date = '2024-01-01', '2024-08-10'
symbols = ['AAPL', 'MSFT', 'GOOG', 'AMZN']
stock_data = yf.download(symbols, start=start_date, end=end_date)['Adj Close']
stock_data.to_csv("stock_cache.csv", index=False)
# stock_data = pd.read_csv("stock_cache.csv")
returns = stock_data.pct_change().dropna()
momentum = stock_data.pct_change(periods=5).dropna()

sma_10 = stock_data.rolling(window=10).mean()  

volatility = returns.rolling(window=10).std()
X = pd.DataFrame()

for sym in range(len(symbols)):
    df_ = pd.concat([returns.iloc[:, sym], sma_10.iloc[:, sym], volatility.iloc[:, sym]], axis=1).dropna(axis=0)
    X = pd.concat([X, df_], axis = 1)

# Convert to tensor: [T, N, F], where F = number of features
X = X.values  
X = X.reshape(X.shape[0], len(symbols), 3)
X = torch.tensor(X, dtype=torch.float32)

correlation_matrix = returns.corr()
edges = []

threshold = 0.5
for i in range(correlation_matrix.shape[0]):
    for j in range(i + 1, correlation_matrix.shape[1]):
        if abs(correlation_matrix.iloc[i, j]) > threshold:
            print("???")
            edges.append([i, j])
            edges.append([j, i]) 

edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
y = torch.tensor(momentum.values, dtype=torch.float)  # Shape [T', N]
y = y.unsqueeze(2)
lim = min(X.shape[0], y.shape[0])
X = X[0:lim]
y = y[0:lim]


input_dim = X.shape[2]
hidden_dim = 16
output_dim = 1
num_layers = 2

model = DCRNN(input_dim, hidden_dim, output_dim, num_layers)
optimizer = optim.Adam(model.parameters(), lr=0.01)
loss_fn = nn.MSELoss()
epochs = 100
for epoch in range(epochs):
    model.train()
    optimizer.zero_grad()
    output, _ = model(X, edge_index)  
    loss = loss_fn(output, y)

    loss.backward()
    optimizer.step()
    if (epoch + 1) % 10 == 0:
        print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')

y = torch.where(y.flatten() > 0, torch.tensor(1.0), torch.tensor(0.0))
output = torch.where(output.flatten() > 0, torch.tensor(1.0), torch.tensor(0.0))

print((y == output).sum().item() / len(y))