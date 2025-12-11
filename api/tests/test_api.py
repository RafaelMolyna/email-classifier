import pytest
from unittest.mock import patch, MagicMock
from api.index import app
import json


@pytest.fixture
def client():
    app.config["TESTING"] = True
    # We disable the rate limiter for tests so we don't block ourselves
    app.config["RATELIMIT_ENABLED"] = False
    with app.test_client() as client:
        yield client


# --- TEST 1: Check Happy Path (Productive) ---
def test_classify_productive_email(client):
    # This is the "Fake" answer we want Gemini to return
    mock_response_content = json.dumps(
        {
            "category": "Productive",
            "suggested_response": "Sure, let's meet.",
            "purpose": "Meeting",
            "probability": 0.95,
            "justification": "Clear work request",
        }
    )

    # We "Patch" (hijack) the model.generate_content function
    with patch("api.index.model.generate_content") as mock_gemini:
        # Configure the mock to return our fake object
        mock_gemini.return_value.text = mock_response_content

        # Make the request to YOUR api
        response = client.post(
            "/", json={"email": "Hey, can we schedule a meeting for the project?"}
        )

        # Check if YOUR api handled it correctly
        assert response.status_code == 200
        data = response.get_json()

        # Verify structure
        assert "category" in data
        assert data["category"] == "Productive"
        assert data["probability"] > 0.9


# --- TEST 2: Check Happy Path (Unproductive) ---
def test_classify_unproductive_email(client):
    mock_response_content = json.dumps(
        {
            "category": "Unproductive",
            "suggested_response": "Thanks.",
            "purpose": "Spam",
            "probability": 0.1,
            "justification": "Spam content",
        }
    )

    with patch("api.index.model.generate_content") as mock_gemini:
        mock_gemini.return_value.text = mock_response_content

        response = client.post("/", json={"email": "Buy cheap rolex watches now!"})

        assert response.status_code == 200
        assert response.get_json()["category"] == "Unproductive"


# --- TEST 3: Check Error Handling (Empty Email) ---
def test_empty_email(client):
    response = client.post("/", json={"email": ""})
    assert response.status_code == 400
    assert "error" in response.get_json()


# --- TEST 4: Check if AI Returns Garbage JSON ---
def test_ai_garbage_output(client):
    # Simulate Gemini returning non-JSON text
    with patch("api.index.model.generate_content") as mock_gemini:
        mock_gemini.return_value.text = "I am a language model, I cannot answer."

        response = client.post("/", json={"email": "Hello"})

        # Your API should catch this and return 500
        assert response.status_code == 500
        assert "error" in response.get_json()
