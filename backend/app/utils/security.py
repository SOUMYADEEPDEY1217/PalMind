import hashlib
import secrets
from typing import Optional

def hash_password(password: str) -> str:
    """Hashes a password with PBKDF2 HMAC-SHA256 and a random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100_000)
    return f"{salt}:{key.hex()}"

def verify_password(stored_password: Optional[str], provided_password: str) -> bool:
    """Verifies a password against the stored salt:hash string."""
    if not stored_password or ":" not in stored_password:
        return False
    try:
        salt, stored_hash = stored_password.split(":", 1)
        key = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt.encode('utf-8'), 100_000)
        return secrets.compare_digest(key.hex(), stored_hash)
    except Exception:
        return False

def generate_session_token() -> str:
    """Generates a cryptographically strong session token."""
    return secrets.token_urlsafe(32)
