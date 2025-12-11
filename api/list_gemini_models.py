import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env file
load_dotenv()

print("Connecting to Google AI...")

models_list = []

try:
    # Configure with your key
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])

    print("\n--- Models Available for generateContent ---")
    # List all models
    for m in genai.list_models():
        # We only care about models that can 'generateContent'
        if "generateContent" in m.supported_generation_methods:
            print(m.name)
            models_list.append(m.name)

    # Write the models list to a file
    with open("models.txt", "w") as f:
        f.write("\n".join(models_list))

    print("\nTest complete.")

except Exception as e:
    print(f"\n--- ERROR ---")
    print(f"Failed to list models: {e}")
