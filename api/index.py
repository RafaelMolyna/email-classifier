import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from prompts import (
    classification_schema_email_app,
    system_prompt_email_app,
    WORKING_MODEL_NAME,
)
import json


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# This tells Flask to identify users by their IP address
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per day", "20 per hour"],
    storage_uri="memory://",
)

try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])

    # --- 4. Configure the model with System Instruction ---
    model = genai.GenerativeModel(
        model_name=WORKING_MODEL_NAME,
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": classification_schema_email_app,
        },
        system_instruction=system_prompt_email_app,
    )

except Exception as e:
    print(f"Error initializing Gemini: {e}")
    model = None


# --- 5. The prompt function ---
def get_ai_prompt(email_text):
    """
    Creates the simple prompt, sending only the new email.
    The main instructions are already in the model's system_instruction.
    """
    return f"""
    Email to be analyzed:
    ---
    {email_text}
    ---
    """


@app.route("/", defaults={"path": ""}, methods=["GET", "POST"])
@app.route("/<path:path>", methods=["GET", "POST"])
def catch_all(path):

    if request.method == "POST":
        if model is None:
            return jsonify({"error": "Gemini model not initialized"}), 500

        try:
            data = request.json
            raw_email_text = data.get("email")

            if not raw_email_text:
                return jsonify({"error": "No email text provided"}), 400

            # --- 5. Just get the prompt and call the AI ---
            prompt = get_ai_prompt(raw_email_text)
            response = model.generate_content(prompt)

            # Validate the response *before* sending it.
            try:
                # Get the text
                ai_text = response.text

                # Try to parse it to make sure it's not empty
                json.loads(ai_text)

                # If it's valid, send it
                return ai_text, 200, {"Content-Type": "application/json"}

            except (json.JSONDecodeError, ValueError):
                # If 'response.text' was empty or invalid, this catches it.
                print(
                    f"AI returned an empty or invalid response. Raw response: {response.text}"
                )
                return (
                    jsonify({"error": "The AI failed to generate a valid response."}),
                    500,
                )

        except Exception as e:
            print(f"Error during AI processing: {e}")
            return jsonify({"error": f"AI processing error: {e}"}), 500

    # GET request handler
    return jsonify({"message": "Hello from the Python backend!"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
