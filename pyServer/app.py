import numpy as np
import pandas as pd
from scipy.optimize import minimize
import yfinance as yf
import matplotlib.pyplot as plt

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
import base64
app = Flask(__name__)
CORS(app) 


def get_historical_data(symbols, start_date, end_date):
    try:
        data = yf.download(symbols, start=start_date, end=end_date)['Adj Close']
        if data.empty:
            print("Warning: No data fetched for given symbols and dates.")
        return data
    except Exception as e:
        print("Error fetching data:", e)
        return pd.DataFrame()  # Return an empty DataFrame on error


def calculate_daily_returns(prices):
    return prices.pct_change().dropna()

# Compute mean returns and covariance matrix
def compute_statistics(returns):
    if isinstance(returns, pd.Series):
        returns = pd.DataFrame(returns) 
    mean_returns = returns.mean()
    cov_matrix = returns.cov()
    return mean_returns, cov_matrix

# Portfolio performance metrics
def portfolio_performance(weights, mean_returns, cov_matrix):
    portfolio_return = np.sum(mean_returns * weights) * 252  # Annualized return
    portfolio_stddev = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))) * np.sqrt(252)  # Annualized risk
    return portfolio_return, portfolio_stddev

# Objective function for optimization
def objective_function(weights, mean_returns, cov_matrix):
    return -portfolio_performance(weights, mean_returns, cov_matrix)[0]  # Negative return for maximization

# Plotting the Efficient Frontier
def plot_efficient_frontier(results_df, optim_return, optim_risk):
    plt.figure(figsize=(10, 6))
    plt.scatter(results_df["Risk"], results_df["Return"], c=results_df["Return"] / results_df["Risk"], cmap='viridis', marker='o')
    plt.title(f'Efficient Frontier w Optim Sharpe: {optim_return / optim_risk}')
    plt.xlabel('Risk (Standard Deviation)')
    plt.ylabel('Expected Return')
    plt.colorbar(label='Sharpe Ratio')
    plt.grid()


@app.route('/optimize-portfolio', methods=['POST'])
def optimize_portfolio():
    data = request.json
    symbols = data['symbols']
    start_date = data.get('start_date', '2020-10-01')
    end_date = data.get('end_date', '2024-10-20')

    print("Fetching data for symbols:", symbols)

    historical_data = get_historical_data(symbols, start_date, end_date)

    # Check if historical data is empty
    if historical_data.empty:
        return jsonify({"error": "No data available for the given symbols and dates."}), 400


    returns = calculate_daily_returns(historical_data)
    mean_returns, cov_matrix = compute_statistics(returns)

    num_assets = len(symbols)
    results = []
    iters = 1000

    for _ in range(iters):
        weights = np.random.random(num_assets)
        weights /= np.sum(weights)
        return_, risk = portfolio_performance(weights, mean_returns, cov_matrix)
        results.append((return_, risk, weights))

    results_df = pd.DataFrame(results, columns=["Return", "Risk", "Weights"])
    max_sharpe_idx = (results_df['Return'] / results_df['Risk']).idxmax()
    optimized_weights = results_df.iloc[max_sharpe_idx]["Weights"]
    optim_return = results_df.iloc[max_sharpe_idx]["Return"]
    optim_risk = results_df.iloc[max_sharpe_idx]["Risk"]
    riskVals = results_df["Risk"]
    returnVals = results_df["Return"]

    # plot_efficient_frontier(results_df, optim_return, optim_risk)

    # img = BytesIO()
    # plt.savefig(img, format='png')
    # img.seek(0)
    # plt.close()

    # # Encode the image in base64 for frontend display
    # img_base64 = base64.b64encode(img.getvalue()).decode('utf-8')

    # Send weights and image in JSON response
    return jsonify({"weights": optimized_weights.tolist(), "risks": riskVals.tolist(), "returns": returnVals.tolist(), "optim_risk": optim_risk, "optim_return": optim_return})
    # return jsonify({"weights": optimized_weights.tolist(), "image": img_base64})


# Example usage
if __name__ == "__main__":
    
    app.run(port=5002)
    print("Flask run successfully!")

   