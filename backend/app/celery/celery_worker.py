import os
from celery import Celery
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Get Redis URLs from environment variables, with fallbacks
BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis-dev:6379/0")
BACKEND_URL = os.getenv("CELERY_RESULT_BACKEND", "redis://redis-dev:6379/1")

celery_app = Celery(
    "automation_tasks",
    broker=BROKER_URL,
    backend=BACKEND_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

celery_app.autodiscover_tasks(["app.celery"])