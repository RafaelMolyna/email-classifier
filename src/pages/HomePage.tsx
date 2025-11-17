import React, { useState } from "react";
import Header from "../components/Header";
import EmailInput from "../components/EmailInput";
import ResultDisplay from "../components/ResultDisplay";
import Footer from "../components/Footer";
import { analyzeEmail } from "../services/geminiService";
import type { ClassificationResult } from "../types";
import { TypeAnimation } from "react-type-animation";

const HomePage: React.FC = () => {
  const [emailText, setEmailText] = useState<string>("");
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(true);

  const handleAnalyze = async () => {
    if (!emailText.trim()) {
      setError("O campo de e-mail não pode estar vazio.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeEmail(emailText);
      setResult(analysisResult);
    } catch (err: Error | unknown) {
      const message =
        err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmailText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
      <style>
        {`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
          }
        `}
      </style>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        <div className="text-center w-full max-w-3xl position-relative">
          <div className="min-h-[64px] flex items-center h-24 justify-center">
            {isTyping ? (
              <TypeAnimation
                sequence={[
                  1000,
                  "Otimize seu Fluxo de Trabalho ✓",
                  3000,
                  "Responda E-mails 10x mais Rápido ✓",
                  3000,
                  "Foque no que Realmente Importa ✓",
                  3000,
                  "Analisador de Email com IA ",
                  () => setIsTyping(false),
                ]}
                // preRenderFirstString={true}
                // omitDeletionAnimation={true}
                wrapper="h2"
                speed={{ type: "keyStrokeDelayInMs", value: 50 }}
                deletionSpeed={{ type: "keyStrokeDelayInMs", value: 12 }}
                className="text-4xl font-extrabold text-white sm:text-5xl"
                repeat={0}
                cursor={true}
              />
            ) : (
              <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
                Analisador de Email com IA ✓
              </h2>
            )}
          </div>
          <p className="my-6 text-lg text-gray-400 max-w-2xl mx-auto position-absolute bottom-0">
            Deixe a IA classificar seus emails e sugerir respostas, liberando
            tempo para o que realmente importa.
          </p>
        </div>

        <EmailInput
          emailText={emailText}
          setEmailText={setEmailText}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          onClear={handleReset}
        />

        {error && (
          <div className="mt-6 w-full max-w-2xl p-4 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg text-center animate-fade-in-up">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {result && (
          <ResultDisplay
            result={result}
            onClose={handleReset}
            originalEmailText={emailText}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
