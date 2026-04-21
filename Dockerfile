# Use python:3.9-slim as requested
FROM python:3.9-slim

LABEL maintainer="MLOps-style batch job"
LABEL version="1.0"

# Set non-root working directory
WORKDIR /app

# Install dependencies first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and required data
COPY run.py .
COPY config.yaml .
COPY data.csv .

# The following files will be generated at runtime:
# metrics.json
# run.log

# Command triggers the exact run requirement
ENTRYPOINT ["python", "run.py", "--input", "data.csv", "--config", "config.yaml", "--output", "metrics.json", "--log-file", "run.log"]
