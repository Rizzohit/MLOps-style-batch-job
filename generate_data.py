import pandas as pd
import numpy as np

def generate_data(n=10000):
    np.random.seed(42)
    dates = pd.date_range('2023-01-01', periods=n, freq='min')
    
    # Generate random walk for prices
    close = 100 + np.cumsum(np.random.randn(n) * 0.1)
    open_p = close + np.random.randn(n) * 0.05
    high = np.maximum(open_p, close) + np.random.rand(n) * 0.1
    low = np.minimum(open_p, close) - np.random.rand(n) * 0.1
    volume = np.random.randint(100, 1000, size=n)
    
    df = pd.DataFrame({
        'timestamp': dates,
        'open': open_p,
        'high': high,
        'low': low,
        'close': close,
        'volume': volume
    })
    
    df.to_csv('data.csv', index=False)
    print("Generated data.csv with 10,000 rows.")

if __name__ == "__main__":
    generate_data()
