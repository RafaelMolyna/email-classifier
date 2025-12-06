# api/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed (none for now, but good practice)
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements from the api folder
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the Flask port
EXPOSE 5001

# Run the app (ensure your index.py listens on host='0.0.0.0')
CMD ["python", "index.py"]
