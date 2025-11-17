import React, { useRef, useState } from 'react';
import { UploadIcon, ClearIcon } from './icons';
import * as pdfjsLib from 'pdfjs-dist';

// Configura o caminho do worker para a biblioteca pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^4.6.300/build/pdf.worker.mjs`;

interface EmailInputProps {
  emailText: string;
  setEmailText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onClear: () => void;
}

const EmailInput: React.FC<EmailInputProps> = ({ emailText, setEmailText, onAnalyze, isLoading, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFileProcessing, setIsFileProcessing] = useState(false);

  const processFile = async (file: File | undefined) => {
    if (!file) return;

    onClear(); // Limpa o estado anterior (texto, resultado, erros) para mostrar o loading
    setIsFileProcessing(true);
    setFileError(null);

    const allowedTypes = ["text/plain", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Formato de arquivo inválido. Por favor, envie apenas .txt ou .pdf.");
      setIsFileProcessing(false);
      return;
    }

    try {
      let textContent = '';
      if (file.type === "text/plain") {
        textContent = await file.text();
      } else if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
          fullText += pageText + '\n\n';
        }
        textContent = fullText.trim();
      }
      
      // Aumenta o delay para 1s e só atualiza o texto e o estado de loading depois
      setTimeout(() => {
        setEmailText(textContent);
        setIsFileProcessing(false);
      }, 1000);

    } catch (error) {
      console.error("Error processing file:", error);
      setFileError("Não foi possível ler o arquivo.");
      setIsFileProcessing(false); // Para o loading imediatamente em caso de erro
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setEmailText(text);
        setFileError(null);
      }
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      setFileError(
        "Não foi possível colar da área de transferência. Verifique as permissões do seu navegador."
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800/60 p-6 rounded-2xl shadow-xl backdrop-blur-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <label
          htmlFor="email-input"
          className="text-lg font-semibold text-gray-300"
        >
          {isTouchDevice
            ? "Cole o conteúdo do email"
            : "Cole o conteúdo do email ou arraste e solte um arquivo"}
        </label>
        <button
          onClick={handlePaste}
          disabled={isLoading || isFileProcessing}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Colar da área de transferência"
          aria-label="Colar da área de transferência"
        >
          <ClipboardIcon />
        </button>
      </div>
      <textarea
        id="email-input"
        value={emailText}
        onChange={(e) => setEmailText(e.target.value)}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        placeholder="De: joao@exemplo.com&#10;Assunto: Status da Requisição #12345&#10;&#10;Olá equipe,&#10;Gostaria de saber o status atual da minha requisição.&#10;Obrigado,&#10;João"
        className={`w-full h-64 p-4 bg-gray-900 border ${
          isDragging ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-600'
        } rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300`}
        disabled={isLoading || isFileProcessing}
      />
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onAnalyze}
          disabled={!emailText || isLoading || isFileProcessing}
          className="w-full sm:w-auto flex-grow bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analisando...
            </div>
          ) : 'Analisar Email'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.pdf"
          className="hidden"
          disabled={isLoading || isFileProcessing}
        />
        {emailText ? (
           <button
                onClick={onClear}
                disabled={isLoading || isFileProcessing}
                className="w-full sm:w-auto flex items-center justify-center bg-rose-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50"
            >
                <ClearIcon />
                Limpar
            </button>
        ) : (
            <button
              onClick={handleUploadClick}
              disabled={isLoading || isFileProcessing}
              className="w-full sm:w-auto flex items-center justify-center bg-sky-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50"
            >
              {isFileProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </div>
              ) : (
                <>
                  <UploadIcon />
                  Carregar Arquivo
                </>
              )}
            </button>
        )}
      </div>
       <div className="mt-3 text-center sm:text-left">
        {fileError && <p className="text-sm text-red-400">{fileError}</p>}
        {!fileError && <p className="text-xs text-gray-500">Formatos aceitos: .txt e .pdf</p>}
      </div>
    </div>
  );
};

export default EmailInput;