import type { ClassificationResult } from "../types";

// This is the only function your frontend needs.
// It doesn't call Google. It calls OUR Python server.
export async function analyzeEmail(
  emailText: string
): Promise<ClassificationResult> {
  const response = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Send the email text to our Python backend
    body: JSON.stringify({ email: emailText }),
  });

  if (!response.ok) {
    // If the server crashed (500) or we sent bad data (400)
    // try to get the error message from the backend.
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro desconhecido do servidor");
  }

  // The backend already guaranteed this is valid JSON
  const result: ClassificationResult = await response.json();
  return result;
}
