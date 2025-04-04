# Dockerfile

FROM python:3.11

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /code

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . .

# Default command (used by uvicorn for FastAPI)
CMD ["uvicorn", "mainModule:app", "--host", "0.0.0.0", "--port", "8000"]

RUN playwright install --with-deps

RUN pip install --no-cache-dir -r requirements.txt
