export interface ClassificationResult {
  categoria: "Produtivo" | "Improdutivo";
  sugestao_resposta: string;
  proposito: string;
  probabilidade: number;
  justificativa_produtividade: string;
}
