import os
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import create_engine

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

DB_USER = os.getenv("POSTGRES_USER", "myuser")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "mine123")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5433")
DB_NAME = os.getenv("POSTGRES_DB", "market_db")

DATABASE_URL = (
    f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

print(DB_USER, DB_PASSWORD)
# in connection.py temporarily
print("Connecting to:", DATABASE_URL.replace(DB_PASSWORD, "***"))
engine = create_engine(DATABASE_URL, echo=False)