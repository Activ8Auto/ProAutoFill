from celery import Celery

celery_app = Celery(
    "automation_tasks",
    broker="redis://localhost:6379/0",  # or use Docker hostname
    backend="redis://localhost:6379/1"
)

celery_app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
)
celery_app.autodiscover_tasks(["app.celery"])