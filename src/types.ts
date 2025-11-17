export interface ClassificationResult {
  category: "Productive" | "Unproductive";
  suggested_response: string;
  purpose: string;
  probability: number;
  justification: string;
}
