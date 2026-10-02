import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth_signup_and_signin():
    # 1. Sign up new user with email
    signup_data = {
        "name": "Jordan Lee",
        "email": "jordan.lee@gmail.com",
        "password": "Password1234!",
        "goal": "Score top 5% in computer science exams"
    }
    res = client.post("/api/auth/signup", json=signup_data)
    assert res.status_code in [200, 400]  # 400 if already exists
    if res.status_code == 200:
        data = res.json()
        assert "token" in data
        assert data["user"]["email"] == "jordan.lee@gmail.com"
        assert data["user"]["name"] == "Jordan Lee"

    # 2. Sign in with valid credentials
    signin_res = client.post("/api/auth/signin", json={
        "email": "jordan.lee@gmail.com",
        "password": "Password1234!"
    })
    assert signin_res.status_code == 200
    signin_data = signin_res.json()
    assert "token" in signin_data
    assert signin_data["user"]["email"] == "jordan.lee@gmail.com"

    # 3. Sign in with wrong password
    bad_res = client.post("/api/auth/signin", json={
        "email": "jordan.lee@gmail.com",
        "password": "WrongPassword"
    })
    assert bad_res.status_code == 401

def test_auth_google_login():
    res = client.post("/api/auth/google", json={
        "email": "google.student@gmail.com",
        "name": "Google Student",
        "picture": "https://lh3.googleusercontent.com/a/student-avatar"
    })
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == "google.student@gmail.com"
    assert data["user"]["auth_provider"] == "google"
    assert data["user"]["avatar_url"] == "https://lh3.googleusercontent.com/a/student-avatar"
