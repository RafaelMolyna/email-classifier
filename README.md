# 📧 AI Email Classifier

A full-stack web application designed to automate email processing. This project uses Generative AI to analyze incoming emails, classify them as "Productive" or "Unproductive," extract the main intent, and generate context-aware suggested responses in the appropriate language.

This project was built as part of a technical selection process, serving as both a practical solution and a demonstration of modern full-stack architecture.

---

## 🚀 1. Project Overview & Architecture

### What it does

The application provides a clean interface for users to paste email content. The backend processes this text using Google's Gemini AI to return a structured JSON analysis containing:

- **Classification:** Productive vs. Unproductive.
- **Confidence Score:** A probability rating (0.0 - 1.0).
- **Purpose:** The specific intent of the email (e.g., "Support Request", "Spam").
- **Justification:** Why the AI made this decision.
- **Suggested Response:** A professional draft response in the original language of the email.

### Technical Stack Decisions

- **React + TypeScript (Vite):** Selected for a robust, type-safe frontend. Vite ensures lightning-fast build times, and TypeScript prevents common runtime errors, which is essential for handling the strict data contract required by the API.
- **Python (Flask):** Used as a lightweight "proxy" backend. Since API keys must be kept secure (and never exposed to the browser), Flask handles the authentication with Google and forwards the sanitized JSON to the frontend.
- **Tailwind CSS:** Used for rapid, utility-first styling to create a modern, responsive UI without writing custom CSS files.
- **Vercel:** The hosting platform of choice. Vercel was selected for its native support of **Monorepos** (hosting both a React frontend and Python Serverless Functions in the same repository) with zero configuration.

### Backend Architecture Deep Dive

Two specific architectural choices were made in the Python backend to ensure reliability and efficiency:

#### 1. System Instructions (`system_prompt`)

Instead of sending the full set of rules (definitions of "Productive", formatting requirements, etc.) with every single user request, we utilize the **System Instruction** feature.

- **How it works:** We "prime" the model with its persona and rules once during initialization.
- **Advantage:** This separates the _logic_ (instructions) from the _data_ (the email). It reduces token usage (cost), improves latency, and ensures the model never "forgets" its role, even with long email inputs.

#### 2. Native JSON Mode (`classification_schema`)

We explicitly define the output structure using a Python dictionary (`classification_schema`) and enforce **JSON Mode** in the model configuration.

- **How it works:** We pass a strict schema to the model's `generation_config`. This forces the AI to output valid JSON that strictly adheres to our defined keys (e.g., `category`, `probability`).
- **Advantage:** This eliminates the need for fragile text parsing or Regular Expressions. It guarantees that the backend always receives valid JSON, preventing "Unexpected end of JSON input" errors and ensuring type safety when data reaches the TypeScript frontend.

---

## 🛠️ 2. Local Development Guide

Follow these steps to run the project locally on your machine.

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- A **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### Step 1: Clone the Repository

```bash
# SSH clone:
git clone git@github.com:RafaelMolyna/email-classifier.git
# or HTTPS clone
# git clone https://github.com/RafaelMolyna/email-classifier.git
# Go to directory:
cd email-classifier
```

### Step 2: Backend Setup (Choose Option A or B)

#### Option A: Manual Terminal Setup

1. **Create the virtual environment:**

   ```bash
   # Windows
   python -m venv .venv

   # Mac/Linux
   python3 -m venv .venv
   ```

2. **Activate the environment:**

   ```bash
   # Windows (PowerShell)
   .\.venv\Scripts\Activate

   # Mac/Linux
   source .venv/bin/activate
   ```

   _(You should see `(.venv)` appear in your terminal prompt)_

3. **Install dependencies:**

   ```bash
   pip install -r api/requirements.txt
   ```

#### Option B: VS Code Automated Setup (Easier🎉)

1. Open the project folder in VS Code.
2. Open the Command Palette (`Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on Mac).
3. Type and select **Python: Create Environment**.
4. Select **Venv**.
5. Select your installed Python interpreter (e.g., Python 3.11).
6. VS Code will create the `.venv` folder and configure your workspace.
7. Open a **new terminal** in VS Code (`Ctrl + ~`). VS Code will automatically activate the environment (you will see `(.venv)` in the prompt).
8. Run the install command:

   ```bash
   pip install -r api/requirements.txt
   ```

### Step 3: Frontend Setup (Node.js)

Open a **new terminal window** (keep the Python one open) and run:

```bash
npm install
```

### Step 4: Environment Configuration

Security is key. You need to tell the backend your Gemini API key.

1. Create a file named `.env` in the **root** of the project.
2. Add your API Key inside it:

   ```env
   GEMINI_API_KEY=AIzaSy...<YOUR_KEY_HERE>
   ```

### Step 5: Run the Application

You need to run both the Backend and the Frontend simultaneously.

**Terminal 1 (Backend):**
Make sure your virtual environment is active `(.venv)`:

```bash
python api/index.py
```

_The server will start on <http://localhost:5001>_

**Terminal 2 (Frontend):**

```bash
npm run dev
```

_The frontend will start on <http://localhost:5173>_

### 🏁 Ready ❕❕❕

Open your browser to **<http://localhost:5173>**. The application is now running locally. The frontend (Vite) is configured to automatically proxy API requests to the Flask backend.
