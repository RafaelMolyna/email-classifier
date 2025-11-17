import React, { useState } from "react";
import { jsPDF } from "jspdf";
import type { ClassificationResult } from "../types";
import {
  ProductiveIcon,
  UnproductiveIcon,
  CopyIcon,
  CloseIcon,
  DownloadIcon,
} from "./icons";

interface ResultDisplayProps {
  result: ClassificationResult | null;
  onClose: () => void;
  originalEmailText: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  onClose,
  originalEmailText,
}) => {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return null;
  }

  const isProductive = result.category === "Productive";

  const handleCopy = () => {
    navigator.clipboard.writeText(result.suggested_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - margin * 2;
    let yPos = 20;

    // --- Helper para add sections with line breaks ---
    const addSection = (
      title: string,
      content: string,
      titleSize = 16,
      contentSize = 12,
      isContentMonospace = false
    ) => {
      if (yPos > 260) {
        // Adiciona nova página se o conteúdo não couber
        doc.addPage();
        yPos = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(titleSize);
      doc.setTextColor(40);
      doc.text(title, margin, yPos);
      yPos += 8;

      doc.setFont(isContentMonospace ? "courier" : "helvetica", "normal");
      doc.setFontSize(contentSize);
      doc.setTextColor(80);
      const splitContent = doc.splitTextToSize(content, textWidth);
      doc.text(splitContent, margin, yPos);
      yPos += splitContent.length * (contentSize / 2.5) + 10;
    };

    // --- Title ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Relatório de Análise de Email", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(new Date().toLocaleString("pt-BR"), pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    // --- Analysis sumary ---
    addSection(
      "Resumo da Análise",
      `Categoria: ${
        result.category === "Productive" ? "Produtivo" : "Improdutivo"
      }\n` +
        `Propósito: ${result.purpose}\n` +
        `Nível de Produtividade: ${Math.round(result.probability * 100)}%\n` +
        `Justificativa: ${result.justification}`,
      16,
      11
    );

    // --- Suggested response ---
    addSection("Sugestão de Resposta", result.suggested_response, 16, 11, true);

    // --- Division Line ---
    doc.setDrawColor(220);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // --- Original email ---
    addSection("Email Original Analisado", originalEmailText, 16, 10, true);

    doc.save("analise-de-email.pdf");
  };

  const probabilityColor = `hsl(${result.probability * 120}, 60%, 50%)`;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in-up">
      <div
        className={`relative bg-gray-800/60 border ${
          isProductive ? "border-green-500/50" : "border-yellow-500/50"
        } rounded-2xl shadow-xl backdrop-blur-lg overflow-hidden`}
      >
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            onClick={handleDownloadPdf}
            className="p-1.5 rounded-full bg-gray-700/50 hover:bg-gray-600/70 text-gray-400 hover:text-white transition-all duration-200"
            aria-label="Baixar análise em PDF"
            title="Baixar análise em PDF"
          >
            <DownloadIcon />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-700/50 hover:bg-gray-600/70 text-gray-400 hover:text-white transition-all duration-200"
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-200 mb-4">
            Resultado da Análise
          </h2>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              {isProductive ? <ProductiveIcon /> : <UnproductiveIcon />}
              <p className="text-lg">
                <span className="font-semibold text-gray-400">Categoria: </span>
                <span
                  className={`font-bold ${
                    isProductive ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {result.category === "Productive"
                    ? "Produtivo"
                    : "Improdutivo"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <p className="text-lg">
                <span className="font-semibold text-gray-400">Propósito: </span>
                <span className="font-medium text-gray-300">
                  {result.purpose}
                </span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl pt-1">✍️</span>
              <p className="text-lg text-gray-300">
                <span className="font-semibold text-gray-400">
                  Justificativa:{" "}
                </span>
                {result.justification}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">
            Nível de Produtividade
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${result.probability * 100}%`,
                  backgroundColor: probabilityColor,
                }}
              ></div>
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: probabilityColor }}
            >
              {Math.round(result.probability * 100)}%
            </span>
          </div>
        </div>

        <div className="p-5 bg-gray-900/30">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">
            Sugestão de Resposta
          </h3>
          <div className="relative bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-300 whitespace-pre-wrap">
              {result.suggested_response}
            </p>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              aria-label="Copiar resposta"
            >
              {copied ? (
                <span className="text-xs">Copiado!</span>
              ) : (
                <CopyIcon />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
