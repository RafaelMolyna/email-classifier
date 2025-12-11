# --- 1. Define the JSON schema in Python ---
# This tells the AI EXACTLY what to output.
classification_schema_email_app = {
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
system_prompt_email_app = """
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
