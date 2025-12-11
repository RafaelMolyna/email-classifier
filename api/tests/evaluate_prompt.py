import time
import json
import os
from dotenv import load_dotenv
import google.generativeai as genai
from api.index import (
    get_ai_prompt,
    system_prompt,
    classification_schema,
    WORKING_MODEL_NAME,
)

# Load real keys
load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Setup the real model
model = genai.GenerativeModel(
    model_name=WORKING_MODEL_NAME,
    generation_config={
        "response_mime_type": "application/json",
        "response_schema": classification_schema,
    },
    system_instruction=system_prompt,
)

# --- THE GOLDEN DATASET ---
# Real scenarios you want to ensure never break
test_cases = [
    {
        "input": "Hey team, the server is down, please fix ASAP.",
        "expected_category": "Productive",
        "description": "Critical Incident",
    },
    {
        "input": "Congratulations! You won a free iPhone. Click here.",
        "expected_category": "Unproductive",
        "description": "Obvious Spam",
    },
    {
        "input": "Thanks for the lunch yesterday, it was great catching up.",
        "expected_category": "Unproductive",
        "description": "Social/Friendly",
    },
    {
        "input": "Please review the attached contract by Friday.",
        "expected_category": "Productive",
        "description": "Deadline Work",
    },
    {
        "input": """
        Olá, pessoal! Feliz natal e ano novos a todos!
        Antes de mais nada, parabéms ao time pela performance de vendas!
        Por favor, confirmem a lista de presença para o churrasco na casa da Márcia, vamos Comemorar!
        Mas por favor, não esqueça de dar upload do relatório antes de sairmos. Isso precisa estar na mão do cliente amanhã cedo.
        Att, Katy Kat
        """,
        "expected_category": "Productive",
        "description": "Half Productive",
    },
]


def run_eval():
    print(f"🧪 Starting Eval on {WORKING_MODEL_NAME}...")
    score = 0
    total = len(test_cases)

    for case in test_cases:
        print(f"\nTesting: {case['description']}...")
        start_time = time.time()

        # 1. Real Call
        try:
            prompt = get_ai_prompt(case["input"])
            response = model.generate_content(prompt)
            result = json.loads(response.text)

            # 2. Check Logic
            ai_category = result.get("category")
            is_correct = ai_category == case["expected_category"]

            latency = round(time.time() - start_time, 2)

            if is_correct:
                print(f"✅ PASS ({latency}s) - AI said: {ai_category}")
                score += 1
            else:
                print(f"❌ FAIL ({latency}s)")
                print(f"   Expected: {case['expected_category']}")
                print(f"   Got:      {ai_category}")
                print(f"   Reason:   {result.get('justification')}")

        except Exception as e:
            print(f"❌ ERROR: {e}")

    # 3. Final Report
    accuracy = (score / total) * 100
    print(f"\n--------------------------------")
    print(f"Final Score: {accuracy}% ({score}/{total})")

    if accuracy < 100:
        print("⚠️ Warning: Model behavior has degraded.")
        exit(1)
    else:
        print("🚀 Model is acting strictly as defined.")
        exit(0)


if __name__ == "__main__":
    run_eval()
