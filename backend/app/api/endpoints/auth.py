import json
import base64
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import UserProfile
from app.schemas.schemas import (
    UserProfileOut, UserSignUp, UserSignIn, GoogleAuthRequest, AuthResponse
)
from app.utils.security import hash_password, verify_password, generate_session_token

router = APIRouter()

def user_to_out(user: UserProfile) -> UserProfileOut:
    pref_dict = {}
    if user.preferences:
        try:
            pref_dict = json.loads(user.preferences)
        except Exception:
            pref_dict = {}

    return UserProfileOut(
        id=user.id,
        name=user.name or "Friend",
        email=user.email,
        goal=user.goal or "Academic and personal excellence",
        productive_time=user.productive_time or "Morning",
        preferences=pref_dict,
        onboarded=user.onboarded if user.onboarded is not None else False,
        auth_provider=user.auth_provider or "local",
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

def decode_google_credential(credential: str) -> dict:
    """Safely decodes the payload of a Google JWT ID Token without external dependencies."""
    try:
        parts = credential.split(".")
        if len(parts) >= 2:
            payload_b64 = parts[1]
            # Add padding if needed for base64
            padded = payload_b64 + "=" * (-len(payload_b64) % 4)
            decoded_bytes = base64.urlsafe_b64decode(padded.encode("ascii"))
            return json.loads(decoded_bytes.decode("utf-8"))
    except Exception:
        pass
    return {}

@router.post("/auth/signup", response_model=AuthResponse)
def sign_up(data: UserSignUp, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    # Check if user already exists
    existing = db.query(UserProfile).filter(UserProfile.email == email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists. Please sign in instead."
        )

    # Check if there is an unattached initial default user (no email set yet)
    default_guest = db.query(UserProfile).filter(
        (UserProfile.email == None) | (UserProfile.email == "")
    ).first()

    token = generate_session_token()
    hashed = hash_password(data.password)

    if default_guest:
        # Upgrade existing guest user to full account
        default_guest.name = data.name.strip() or "Friend"
        default_guest.email = email
        default_guest.password_hash = hashed
        default_guest.auth_provider = "email"
        default_guest.access_token = token
        if data.goal:
            default_guest.goal = data.goal.strip()
        if data.productive_time:
            default_guest.productive_time = data.productive_time
        default_guest.onboarded = True
        db.commit()
        db.refresh(default_guest)
        user = default_guest
    else:
        user = UserProfile(
            name=data.name.strip() or "Friend",
            email=email,
            password_hash=hashed,
            auth_provider="email",
            access_token=token,
            goal=data.goal.strip() if data.goal else "Academic and personal excellence",
            productive_time=data.productive_time or "Morning",
            preferences="{}",
            onboarded=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return AuthResponse(
        token=token,
        user=user_to_out(user),
        message="Account created successfully!"
    )

@router.post("/auth/signin", response_model=AuthResponse)
def sign_in(data: UserSignIn, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Please provide your email address.")

    user = db.query(UserProfile).filter(UserProfile.email == email).first()
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please verify your credentials or create an account."
        )

    if not verify_password(user.password_hash, data.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password. Please verify your credentials."
        )

    token = generate_session_token()
    user.access_token = token
    db.commit()
    db.refresh(user)

    return AuthResponse(
        token=token,
        user=user_to_out(user),
        message=f"Welcome back, {user.name}!"
    )

@router.post("/auth/google", response_model=AuthResponse)
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    email = data.email
    name = data.name
    picture = data.picture

    # If raw credential JWT was passed from Google Identity Services button
    if data.credential:
        payload = decode_google_credential(data.credential)
        if payload.get("email"):
            email = payload["email"]
        if payload.get("name"):
            name = payload["name"]
        if payload.get("picture"):
            picture = payload["picture"]

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Could not obtain a verified email from Google authentication."
        )

    email = email.strip().lower()
    user = db.query(UserProfile).filter(UserProfile.email == email).first()
    token = generate_session_token()

    if user:
        # Existing user logging in with Google
        user.auth_provider = "google"
        user.access_token = token
        if picture and not user.avatar_url:
            user.avatar_url = picture
        if name and (not user.name or user.name == "Friend"):
            user.name = name
        db.commit()
        db.refresh(user)
    else:
        # Check if default guest user exists to upgrade
        default_guest = db.query(UserProfile).filter(
            (UserProfile.email == None) | (UserProfile.email == "")
        ).first()

        if default_guest:
            default_guest.name = name or "Google Friend"
            default_guest.email = email
            default_guest.auth_provider = "google"
            default_guest.avatar_url = picture
            default_guest.access_token = token
            default_guest.onboarded = True
            db.commit()
            db.refresh(default_guest)
            user = default_guest
        else:
            user = UserProfile(
                name=name or "Google Friend",
                email=email,
                auth_provider="google",
                avatar_url=picture,
                access_token=token,
                goal="Academic and personal excellence",
                productive_time="Morning",
                preferences="{}",
                onboarded=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    return AuthResponse(
        token=token,
        user=user_to_out(user),
        message=f"Signed in as {user.name} via Google!"
    )

@router.get("/auth/me", response_model=UserProfileOut)
def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        user = db.query(UserProfile).filter(UserProfile.access_token == token).first()
        if user:
            return user_to_out(user)

    # Fallback to first user
    user = db.query(UserProfile).first()
    if not user:
        user = UserProfile(name="Friend", onboarded=False)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user_to_out(user)

@router.post("/auth/logout")
def logout(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        user = db.query(UserProfile).filter(UserProfile.access_token == token).first()
        if user:
            user.access_token = None
            db.commit()
    return {"message": "Logged out successfully"}
