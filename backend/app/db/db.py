# backend/app/db/db.py
import os
from tortoise import Tortoise

async def init_db():
    await Tortoise.init(
        db_url=os.getenv("DATABASE_URL"),
        modules={"models": ["app.models.models"]},
    )
    await Tortoise.generate_schemas()


TORTOISE_ORM = {
    "connections": {
        "default": os.getenv("DATABASE_URL", "postgres://AutoFill_owner:npg_6ukJS5TFVLho@ep-fancy-morning-a62bwuep-pooler.us-west-2.aws.neon.tech/AutoFill?ssl=true")
    },
    "apps": {
        "models": {
            "models": [
                "app.models.models",  # your models module
                "aerich.models",      # required for Aerich
            ],
            "default_connection": "default",
        },
    },
}