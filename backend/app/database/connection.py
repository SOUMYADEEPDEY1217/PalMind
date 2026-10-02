from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# For SQLite, check_same_thread=False allows multi-threaded async request handling
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import text

def init_db():
    import app.database.models  # Ensure all models are registered
    Base.metadata.create_all(bind=engine)
    
    # Safely migrate new auth columns for existing SQLite database
    try:
        with engine.connect() as conn:
            for col, col_type in [
                ("email", "VARCHAR(255)"),
                ("password_hash", "VARCHAR(255)"),
                ("auth_provider", "VARCHAR(50) DEFAULT 'local'"),
                ("avatar_url", "VARCHAR(500)"),
                ("access_token", "VARCHAR(255)")
            ]:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                    conn.commit()
                except Exception:
                    pass  # column already exists
    except Exception:
        pass
