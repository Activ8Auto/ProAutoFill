# Use official Python base image
FROM python:3.11

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /code

# Install system dependencies (required for Playwright)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers and dependencies
RUN pip install playwright && playwright install --with-deps

# Copy the rest of your code
COPY . .

# Expose port (optional, not needed unless testing outside Docker)
EXPOSE 8000

# Start the FastAPI app
CMD ["uvicorn", "mainModule:app", "--host", "0.0.0.0","--port", "8000","--proxy-headers"]

