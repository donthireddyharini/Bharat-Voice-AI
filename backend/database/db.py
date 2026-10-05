"""
Database configuration supporting SQLite (local default) and Supabase PostgreSQL.

When SUPABASE_DATABASE_URL or DATABASE_URL is configured with a PostgreSQL connection string
(e.g., postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres or port 6543 pooler),
SQLAlchemy automatically connects directly to Supabase with pooling and SSL enabled.
"""
import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

logger = logging.getLogger("bharathvoice.db")

# Read database URL (Supabase PostgreSQL or local SQLite)
raw_url = os.getenv("SUPABASE_DATABASE_URL") or os.getenv("DATABASE_URL", "sqlite:///./bharathvoice.db")

# Normalize postgres:// to postgresql+psycopg2:// for SQLAlchemy
if raw_url.startswith("postgres://"):
    DATABASE_URL = raw_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+psycopg2://"):
    DATABASE_URL = raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    DATABASE_URL = raw_url

connect_args = {}
engine_kwargs = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Supabase PostgreSQL options
    logger.info("Configuring PostgreSQL connection to Supabase...")
    engine_kwargs = {
        "pool_size": 10,
        "max_overflow": 20,
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from models import db_models  # noqa: F401
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
