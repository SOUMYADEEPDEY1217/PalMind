import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database.models import UserProfile
from app.schemas.schemas import UserProfileOut, UserProfileUpdate
from app.utils.security import hash_password, verify_password

router = APIRouter()

def resolve_user(db: Session, authorization: Optional[str] = None) -> UserProfile:
    """Resolves the currently authenticated user by token, or falls back to first/default user."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        user = db.query(UserProfile).filter(UserProfile.access_token == token).first()
        if user:
            return user

    user = db.query(UserProfile).first()
    if not user:
        user = UserProfile(
            name="Friend",
            goal="Prepare for university exams",
            productive_time="Morning",
            preferences="{}",
            onboarded=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

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

@router.get("/profile", response_model=UserProfileOut)
def get_profile(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = resolve_user(db, authorization)
    return user_to_out(user)

@router.put("/profile", response_model=UserProfileOut)
def update_profile(
    data: UserProfileUpdate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = resolve_user(db, authorization)

    if data.name is not None:
        user.name = data.name.strip()
    
    if data.email is not None:
        clean_email = data.email.strip().lower()
        if clean_email and clean_email != (user.email or "").lower():
            # Check if email is already taken by another user
            existing = db.query(UserProfile).filter(
                UserProfile.email == clean_email,
                UserProfile.id != user.id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="This email address is already in use by another account."
                )
            user.email = clean_email
            if user.auth_provider == "local" or not user.auth_provider:
                user.auth_provider = "email"

    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url.strip() if data.avatar_url else None

    if data.goal is not None:
        user.goal = data.goal.strip()

    if data.productive_time is not None:
        user.productive_time = data.productive_time

    if data.preferences is not None:
        # Merge or replace preferences
        existing_prefs = {}
        if user.preferences:
            try:
                existing_prefs = json.loads(user.preferences)
            except Exception:
                existing_prefs = {}
        existing_prefs.update(data.preferences)
        user.preferences = json.dumps(existing_prefs)

    if data.onboarded is not None:
        user.onboarded = data.onboarded

    # Password update
    if data.new_password:
        if len(data.new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="New password must be at least 6 characters long."
            )
        if user.password_hash:
            if not data.current_password or not verify_password(user.password_hash, data.current_password):
                raise HTTPException(
                    status_code=400,
                    detail="Current password is incorrect. Please verify your current password."
                )
        user.password_hash = hash_password(data.new_password)

    db.commit()
    db.refresh(user)

    return user_to_out(user)
