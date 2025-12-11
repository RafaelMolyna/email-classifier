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

- **React + TypeScript (Vite):** Selected for a robust, type-safe frontend. Vite ensures lightning-fast build times.
- **Python (Flask):** Used as a lightweight "proxy" backend to handle authentication and sanitization.
- **Docker:** Used to containerize both services, ensuring a reproducible development environment across any OS.
- **GitHub Actions (CI):** Automated pipelines for testing, linting, and AI prompt evaluation.

---

## 🛠️ 2. Quick Start (Docker Recommended)

This is the fastest way to run the project. It handles all Python and Node.js dependencies automatically.

### Prerequisites

- **Docker Desktop** installed and running.
- A **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/)).

### Windows Setup Note

If you are on Windows, ensure you have **WSL 2** (Windows Subsystem for Linux) enabled for the best performance.

1. Install Docker Desktop.
2. Go to Settings > General > Check "Use the WSL 2 based engine".
3. Ensure Docker is running (Look for the green whale icon in your system tray).

### Step 1: Environment Setup

1. Clone the repository:

   ```bash
   git clone git@github.com:RafaelMolyna/email-classifier.git
   cd email-classifier
   ```

2. Create a `.env` file in the root directory:

   ```bash
   # Create a file named .env and add your key
   GEMINI_API_KEY=AIzaSy...<YOUR_KEY_HERE>
   ```

### Step 2: Launch the App

Run this single command to build and start both the Frontend and Backend:

```bash
docker compose up
```

- **Frontend:** Open [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
- **Backend:** Running at [http://localhost:5001](https://www.google.com/search?q=http://localhost:5001)

_Note: The first run may take a few minutes to download images. Subsequent runs will be instant._

### 📦 Updating Dependencies

If you add a new library to `package.json` or `requirements.txt`, the Docker container needs to be rebuilt to install them.

Run this command to force a rebuild:

```bash
docker compose up --build
```

**Tip:** If your app acts weird or says "Module not found" even though you installed it, running this command usually fixes it.

---

## 🐢 3. Legacy Setup (Manual)

If you cannot use Docker, you can still run the project manually.

### "No-Docker" Prerequisites

- **Node.js** (v20+)
- **Python** (v3.11+)

### Backend (Python)

```bash
# 1. Create and activate venv
python -m venv .venv
# Windows: .\.venv\Scripts\Activate
# Linux/Mac: source .venv/bin/activate

# 2. Install dependencies
pip install -r api/requirements.txt

# 3. Run Server
python api/index.py
```

### Frontend (Node)

```bash
# In a new terminal:
npm install
npm run dev
```

---

## 🧪 4. Testing & CI/CD

This project uses a **Continuous Integration** pipeline to ensure stability.

### Local Tests

You can run the unit tests locally (requires `pytest` installed):

```bash
# Run the backend logic tests (Mocked AI)
pytest api/tests/
```

### Automated Pipeline

Every Pull Request to `main` triggers:

1. **Frontend Build:** Checks for TypeScript errors.
2. **Backend Linting:** Checks for Python syntax errors (`flake8`).
3. **Unit Tests:** Verifies API logic using mocked responses.
4. **Live AI Eval:** (Conditional) If prompt logic changes, the pipeline runs a real test against the Gemini API to ensure 100% accuracy on golden test cases.
