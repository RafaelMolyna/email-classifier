import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import json


# Load environment variables
load_dotenv()
app = Flask(__name__)

# --- 1. Define the JSON schema in Python ---
# This tells the AI EXACTLY what to output.
classification_schema = {
    "type": "object",
    "properties": {
        "category": {
            "type": "string",
            "enum": ["Productive", "Unproductive"],
            "description": "The category of the email.",
        },
        "suggested_response": {
            "type": "string",
            "description": "The suggested response for the email.",
        },
        "purpose": {
            "type": "string",
            "description": "The main purpose of the email.",
        },
        "probability": {
            "type": "number",
            "description": "The probability from 0.0 to 1.0 that the email is productive.",
        },
        "justification": {
            "type": "string",
            "description": "The justification for the productivity score.",
        },
    },
    "required": [
        "category",
        "suggested_response",
        "purpose",
        "probability",
        "justification",
    ],
}

# --- 2. Create the System Instruction ---
# This is sent ONCE when the model is initialized.
system_prompt = """
Analyze the following email text and classify it as 'Productive' or 'Unproductive'.
- 'Productive': Emails that require a specific action or response and are work-related (e.g., support requests, case updates, system inquiries, scheduling work meetings).
- 'Unproductive': Emails that do not require immediate action or are not work-related (e.g., greetings, thank-yous, spam, social event invitations).

In addition to classification, perform the following tasks:
1.  **Generate a short, professional suggested response**, appropriate for the email. **The suggested response must be in the same language as the original email.**
2.  **Determine the email's main purpose** (e.g., 'Support Inquiry', 'Meeting Scheduling', 'Thank You', 'Social Invitation', 'Informational', 'Spam').
3.  **Provide a probability from 0.0 to 1.0** indicating the chance the email is 'Productive'. 1.0 means certainty it is productive, and 0.0 means certainty it is unproductive.
4.  **Provide a short justification (maximum 1 line) for the probability score**, mentioning factors such as language formality, clarity of the request, or the presence of non-work-related elements.
5. **The justification (item 4) and the email's purpose (item 2) MUST be in Portuguese, and the suggested response (item 1) MUST be in the same language as the original email. Any other output MUST be in English.**


You MUST respond only with the defined JSON format.
"""

# --- 3. Set the model name ---
WORKING_MODEL_NAME = "gemini-2.5-flash"

try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])

    # --- 4. Configure the model with System Instruction ---
    model = genai.GenerativeModel(
        model_name=WORKING_MODEL_NAME,
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": classification_schema,
        },
        system_instruction=system_prompt,
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


@app.route("/", defaults={"path": ""})
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
    app.run(debug=True, port=5001)
