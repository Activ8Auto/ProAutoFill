import logging
from logging.handlers import RotatingFileHandler
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from starlette.responses import Response
import time
import os

from app.auth import get_user_from_token  # assumes this is a working async function

# Resolve absolute path to the logs directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # goes up from /app/
LOG_DIR = os.path.join(BASE_DIR, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

log_file = os.path.join(LOG_DIR, "app.log")

# Configure logger
log_formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")

file_handler = RotatingFileHandler(
    filename=log_file,
    maxBytes=1_000_000,  # 1MB per file
    backupCount=5
)
file_handler.setFormatter(log_formatter)

logger = logging.getLogger("autofill_logger")
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(logging.StreamHandler())  # also log to console

# Logging Middleware
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        user = await get_user_from_token(request)

        method = request.method
        path = request.url.path
        client_ip = request.client.host
        user_info = f"{user.email}" if user else "Anonymous"

        logger.info(f"➡️ {method} {path} | User: {user_info} | IP: {client_ip}")
        response: Response = await call_next(request)
        duration = round(time.time() - start, 3)
        logger.info(f"⬅️ {method} {path} | Status: {response.status_code} | Time: {duration}s")

        return response
