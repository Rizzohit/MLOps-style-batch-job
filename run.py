import pandas as pd
import numpy as np
import yaml
import json
import logging
import argparse
import time
import os
import sys
from typing import Dict, Any

def setup_logging(log_file: str) -> None:
    """Sets up Python logging to file and stdout."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )

def load_config(config_path: str) -> Dict[str, Any]:
    """Loads and validates YAML configuration."""
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found: {config_path}")
    
    with open(config_path, 'r') as f:
        try:
            config = yaml.safe_load(f)
        except yaml.YAMLError as e:
            raise ValueError(f"Error parsing YAML config: {e}")
            
    # Validate required fields
    required_fields = ['seed', 'window', 'version']
    for field in required_fields:
        if field not in config:
            raise KeyError(f"Missing required config field: {field}")
            
    return config

def load_data(input_path: str) -> pd.DataFrame:
    """Loads and validates input CSV dataset."""
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input data file not found: {input_path}")
    
    if os.stat(input_path).st_size == 0:
        raise ValueError("Input data file is empty")
        
    try:
        # Read only necessary columns to optimize memory
        df = pd.read_csv(input_path)
    except Exception as e:
        raise ValueError(f"Invalid CSV format: {e}")
        
    if 'close' not in df.columns:
        raise KeyError("Missing required column: 'close'")
        
    return df

def process_data(df: pd.DataFrame, window: int, seed: int) -> pd.DataFrame:
    """Computes rolling mean and generates trade signals."""
    # Set deterministic seed
    np.random.seed(seed)
    
    # Compute Rolling Mean
    logging.info(f"Computing rolling mean with window size: {window}")
    df['rolling_mean'] = df['close'].rolling(window=window).mean()
    
    # Generate Signal: 1 if close > rolling_mean, else 0
    # Consistency Note: First window-1 rows will have NaN rolling_mean. 
    # close > NaN is False, so signal will naturally be 0 for these rows.
    logging.info("Generating trade signals based on close vs rolling mean")
    df['signal'] = (df['close'] > df['rolling_mean']).astype(int)
    
    return df

def main():
    # CLI Argument Parsing
    parser = argparse.ArgumentParser(description="MLOps-style batch job")
    parser.add_argument("--input", required=True, help="Path to input CSV")
    parser.add_argument("--config", required=True, help="Path to config YAML")
    parser.add_argument("--output", required=True, help="Path to output metrics JSON")
    parser.add_argument("--log-file", required=True, help="Path to log file")
    args = parser.parse_args()

    start_time = time.perf_counter()
    setup_logging(args.log_file)
    logging.info("MLOps Job started")

    # Global state for error reporting
    version = "unknown"
    seed = None
    rows_processed = 0

    try:
        # 1) Load Config
        config = load_config(args.config)
        version = config['version']
        seed = config['seed']
        window = config['window']
        logging.info(f"Config loaded: version={version}, seed={seed}, window={window}")

        # 2) Load Dataset
        df = load_data(args.input)
        rows_processed = len(df)
        logging.info(f"Dataset loaded: {rows_processed} rows")

        # 3) Process Data
        df = process_data(df, window, seed)
        
        # 4) Compute Metrics
        signal_rate = float(df['signal'].mean())
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        
        metrics = {
            "version": version,
            "rows_processed": rows_processed,
            "metric": "signal_rate",
            "value": round(signal_rate, 4),
            "latency_ms": latency_ms,
            "seed": seed,
            "status": "success"
        }
        logging.info(f"Job successful. Metrics: {metrics}")
        
    except Exception as e:
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        logging.error(f"Execution failed: {str(e)}")
        metrics = {
            "version": version,
            "status": "error",
            "error_message": str(e)
        }

    # 5) Write Output
    try:
        with open(args.output, 'w') as f:
            json.dump(metrics, f, indent=2)
    except Exception as e:
        logging.error(f"Failed to write metrics file: {e}")

    # Output to stdout as per Docker requirement
    print(json.dumps(metrics, indent=2))
    
    logging.info(f"Job ended. Status: {metrics['status']}")
    
    # Exit code requirement
    if metrics['status'] == "error":
        sys.exit(1)
    sys.exit(0)

if __name__ == "__main__":
    main()
