# MLOps-style batch job

Technical assessment for building a minimal MLOps-style batch job that demonstrates reproducibility, observability, and deployment readiness.

## Project Structure
```text
.
├── Dockerfile          # Container definition
├── README.md           # Documentation
├── config.yaml         # Job configuration
├── data.csv            # Input dataset (OHLCV)
├── metrics.json        # Output machine-readable metrics
├── requirements.txt    # Python dependencies
├── run.log             # Execution logs
└── run.py              # Main processing script
```

## Setup and Installation

### Local Environment
1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Execute the job**:
   ```bash
   python run.py --input data.csv --config config.yaml --output metrics.json --log-file run.log
   ```

### Docker
1. **Build the image**:
   ```bash
   docker build -t mlops-task .
   ```

2. **Run the container**:
   ```bash
   docker run --rm mlops-task
   ```

## Requirements Adherence
- **Python 3.9+**: Uses `python:3.9-slim` base image.
- **Reproducibility**: Pinned seed (42) and window (5) in `config.yaml`.
- **Determinism**: numpy random seed is set at runtime.
- **Observability**: Dual output to `metrics.json` (machine-readable) and `run.log` (human-readable).
- **Graceful Error Handling**: `metrics.json` is written in both success and error states.

## Example metrics.json
```json
{
  "version": "v1",
  "rows_processed": 10000,
  "metric": "signal_rate",
  "value": 0.4990,
  "latency_ms": 127,
  "seed": 42,
  "status": "success"
}
```
