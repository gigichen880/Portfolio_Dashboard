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
        self.dropout = nn.Dropout(p=0.2)

    def forward(self, x, edge_index):
        out = self.conv1(x, edge_index)
        out = self.dropout(F.relu(out))
        out += self.conv2(x, edge_index)
        return out

class DCRNNCell(nn.Module):
    def __init__(self, input_dim, hidden_dim):
        super(DCRNNCell, self).__init__()
        self.graph_conv = DiffusionGraphConv(input_dim, hidden_dim)
        self.gru = nn.GRUCell(hidden_dim, hidden_dim)
        self.bn = nn.BatchNorm1d(hidden_dim)
        self.dropout = nn.Dropout(p=0.2)

    def forward(self, x, edge_index, h):
        x = self.graph_conv(x, edge_index)  # x shape: [T, N, hidden_dim]
        h_new = []
        for t in range(x.size(0)):
            h_t = self.gru(x[t], h) 
            h_t = self.bn(h_t)
            h_t = self.dropout(h_t)
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

def prepare_data(start_date, end_date):     
    
    symbols = pd.read_csv("sp500_syms.csv")['Symbol'].tolist()
    stock_data = pd.DataFrame()
    for symbol in symbols:
        stock_ = pd.DataFrame()
        stock_ = yf.download(symbol, start=start_date, end=end_date)['Adj Close']
        stock_ = stock_.rename(columns={"Adj Close": symbol})
        if not stock_.empty:
            stock_data = pd.concat([stock_data, stock_], axis = 1)
        stock_data.to_csv("stock_cache.csv", index=False)

def prepare_model_params():
    stock_data = pd.read_csv("stock_cache.csv")
    stock_data = stock_data.dropna(axis=1)
    returns = stock_data.pct_change().dropna()
    momentum = stock_data.pct_change(periods=10).dropna()
    sma_10 = stock_data.rolling(window=30).mean()  
    volatility = returns.rolling(window=10).std()
    X = pd.DataFrame()

    for sym in range(len(stock_data.columns)):
        df_ = pd.concat([returns.iloc[:, sym], sma_10.iloc[:, sym], volatility.iloc[:, sym]], axis=1).dropna(axis=0)
        X = pd.concat([X, df_], axis = 1)

    # Convert to tensor: [T, N, F], where F = number of features
    X = X.values  
    X = X.reshape(X.shape[0], len(stock_data.columns), 3)
    from sklearn.preprocessing import StandardScaler
    x_shape = X.shape
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X.reshape(-1, X.shape[2])).reshape(x_shape)
    X = torch.tensor(X_scaled, dtype=torch.float32)

    correlation_matrix = returns.corr()
    edges = []

    threshold = 0.7
    for i in range(correlation_matrix.shape[0]):
        for j in range(i + 1, correlation_matrix.shape[1]):
            if abs(correlation_matrix.iloc[i, j]) > threshold:
                edges.append([i, j])
                edges.append([j, i]) 

    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    y = torch.tensor(momentum.values, dtype=torch.float)  # Shape [T', N]
    y = y.unsqueeze(2)

    lim = min(X.shape[0], y.shape[0])
    X = X[0:lim]
    y = y[0:lim]

    print(torch.isnan(X).sum(), torch.isnan(y).sum())  # Check for NaNs
    return X, y, edge_index

def execute_model(X, y, edge_index):
    input_dim = X.shape[2]
    hidden_dim = 16
    output_dim = 1
    num_layers = 2

    def init_weights(m):
        if isinstance(m, nn.Linear):
            nn.init.xavier_uniform_(m.weight)
            if m.bias is not None:
                nn.init.zeros_(m.bias)
        elif isinstance(m, nn.GRUCell):
            # Initialize GRUCell weights
            nn.init.xavier_uniform_(m.weight_ih)  # Input-hidden weights
            nn.init.xavier_uniform_(m.weight_hh)  # Hidden-hidden weights
            if m.bias_ih is not None:
                nn.init.zeros_(m.bias_ih)
            if m.bias_hh is not None:
                nn.init.zeros_(m.bias_hh)

    model = DCRNN(input_dim, hidden_dim, output_dim, num_layers)
    model.apply(init_weights)

    optimizer = optim.Adam(model.parameters(), lr=0.01, weight_decay=1e-5)
    loss_fn = nn.MSELoss()
    epochs = 100
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        output, _ = model(X, edge_index)  
        loss = loss_fn(output, y)
        # print(output)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        if (epoch + 1) % 10 == 0:
            print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')

    y = torch.where(y.flatten() > 0, torch.tensor(1.0), torch.tensor(0.0))
    output = torch.where(output.flatten() > 0, torch.tensor(1.0), torch.tensor(0.0))

    print((y == output).sum().item() / len(y))

def run():
    start_date, end_date = '2022-01-01', '2024-12-10'
    prepare_data(start_date, end_date)
    X, y, edge_index = prepare_model_params()
    execute_model(X, y, edge_index)

# run()
prepare_data()




from scipy.optimize import minimize
import numpy as np

def optimize_portfolio(momentum_predictions, covariance_matrix, risk_free_rate=0.02):
    """
    Optimize portfolio weights to maximize the Sharpe ratio.
    
    :param momentum_predictions: Array of predicted momentum for stocks.
    :param covariance_matrix: Covariance matrix of stock returns.
    :param risk_free_rate: Risk-free rate.
    :return: Optimized portfolio weights.
    """
    num_stocks = len(momentum_predictions)
    
    # Sharpe ratio objective function (negative for minimization)
    def negative_sharpe(weights):
        portfolio_return = np.dot(weights, momentum_predictions)
        portfolio_risk = np.sqrt(np.dot(weights.T, np.dot(covariance_matrix, weights)))
        return -((portfolio_return - risk_free_rate) / portfolio_risk)
    
    constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1}]
    
    # Bounds: No short-selling
    bounds = [(0, 1) for _ in range(num_stocks)]
    
    # Initial guess: Equal weight distribution
    initial_weights = np.array([1 / num_stocks] * num_stocks)
    
    result = minimize(negative_sharpe, initial_weights, method='SLSQP', bounds=bounds, constraints=constraints)
    
    if not result.success:
        raise ValueError("Optimization failed:", result.message)
    
    return result.x  
