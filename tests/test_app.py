from fastapi.testclient import TestClient
import pytest

from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_success():
    activity_name = "Chess Club"
    email = "testuser@example.com"
    # ensure email not already present
    if email in activities[activity_name]["participants"]:
        activities[activity_name]["participants"].remove(email)

    resp = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert resp.status_code == 200
    body = resp.json()
    assert "Signed up" in body.get("message", "")
    assert email in activities[activity_name]["participants"]


def test_signup_already_signed_up():
    activity_name = "Chess Club"
    email = "duplicate@example.com"
    # ensure email exists
    if email not in activities[activity_name]["participants"]:
        activities[activity_name]["participants"].append(email)

    resp = client.post(f"/activities/{activity_name}/signup?email={email}")
    assert resp.status_code == 400
    data = resp.json()
    assert data.get("detail") == "Student already signed up for this activity"


def test_signup_activity_not_found():
    resp = client.post(f"/activities/Nonexistent/signup?email=abc@def.com")
    assert resp.status_code == 404
    data = resp.json()
    assert data.get("detail") == "Activity not found"
