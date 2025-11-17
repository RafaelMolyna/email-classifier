import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from dotenv import load_dotenv


# Load environment variables
load_dotenv()
app = Flask(__name__)

# --- 1. Define the JSON schema in Python ---
# This is the Python equivalent of the 'responseSchema' from your TS code.
# It tells the AI *exactly* what to output.
classification_schema = {
    "type": "object",
    "properties": {
        "categoria": {
            "type": "string",
            "enum": ["Produtivo", "Improdutivo"],
            "description": "A categoria do email.",
        },
        "sugestao_resposta": {
            "type": "string",
            "description": "A sugestão de resposta para o email.",
        },
        "proposito": {
            "type": "string",
            "description": "O propósito principal do email.",
        },
        "probabilidade": {
            "type": "number",
            "description": "A probabilidade de 0.0 a 1.0 de o email ser produtivo.",
        },
        "justificativa_produtividade": {
            "type": "string",
            "description": "A justificativa para a pontuação de produtividade.",
        },
    },
    "required": [
        "categoria",
        "sugestao_resposta",
        "proposito",
        "probabilidade",
        "justificativa_produtividade",
    ],
}

# --- 2. Set the model name from your TS code ---
# (This model was on your 'ListModels' output, so it's perfect)
WORKING_MODEL_NAME = "gemini-2.5-flash"

try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])

    # --- 3. NEW: Configure the model to use JSON Mode ---
    model = genai.GenerativeModel(
        model_name=WORKING_MODEL_NAME,
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": classification_schema,
        },
        # We no longer need safety_settings, as JSON mode is highly structured.
        # We also no longer need a system_instruction, as the prompt is so detailed.
    )

except Exception as e:
    print(f"Error initializing Gemini: {e}")
    model = None

# --- REMOVED: preprocess_text() function ---
# The new method does not use NLTK.


# --- 4. NEW: The rich prompt from your TS code ---
def get_ai_prompt(email_text):
    """
    Creates the prompt with the new, richer instructions.
    """
    return f"""
    Analise o seguinte texto de e-mail e classifique-o como 'Produtivo' ou 'Improdutivo'.
    - 'Produtivo': E-mails que requerem uma ação ou resposta específica e estão relacionados ao trabalho (ex.: solicitações de suporte, atualização sobre casos, dúvidas sobre o sistema, agendamento de reuniões de trabalho).
    - 'Improdutivo': E-mails que não necessitam de uma ação imediata ou não são relacionados a trabalho (ex.: felicitações, agradecimentos, spam, convites para eventos sociais).

    Além da classificação, execute as seguintes tarefas:
    1.  **Gere uma sugestão de resposta curta e profissional**, apropriada para o e-mail.
    2.  **Determine o propósito principal do email** (ex: 'Consulta de Suporte', 'Agendamento de Reunião', 'Agradecimento', 'Convite Social', 'Informativo', 'Spam').
    3.  **Forneça uma probabilidade de 0.0 a 1.0** indicando a chance de o email ser 'Produtivo'. 1.0 significa certeza de que é produtivo, e 0.0 significa certeza de que é improdututivo.
    4.  **Forneça uma justificativa curta (máximo 1 linha) para a pontuação de probabilidade**, mencionando fatores como a formalidade da linguagem, a clareza da solicitação ou a presença de elementos não relacionados ao trabalho.

    E-mail para análise:
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
            raw_email_text = data.get("email")  # Get the original text

            if not raw_email_text:
                return jsonify({"error": "No email text provided"}), 400

            # --- 5. SIMPLIFIED: Just get the prompt and call the AI ---
            prompt = get_ai_prompt(raw_email_text)
            response = model.generate_content(prompt)

            # --- 6. SIMPLIFIED: No validation needed! ---
            # The API *guarantees* response.text is a valid JSON string
            # that matches our schema. No more 'try/except json.loads'.

            return response.text, 200, {"Content-Type": "application/json"}

        except Exception as e:
            # This catches all OTHER errors
            print(f"Error during AI processing: {e}")
            # The 'google.api_core.exceptions.InvalidArgument' error
            # often means the AI *could not* fulfill the prompt
            # (e.g., the text was just "hello").
            return jsonify({"error": f"AI processing error: {e}"}), 500

    # GET request handler
    return jsonify({"message": "Hello from the Python backend!"})


# Main (unchanged)
if __name__ == "__main__":
    app.run(debug=True, port=5001)
