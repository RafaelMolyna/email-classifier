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
