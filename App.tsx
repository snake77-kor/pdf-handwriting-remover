
import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ProcessingView } from './components/ProcessingView';
import { DownloadSection } from './components/DownloadSection';
import { cleanImageWithGemini } from './services/geminiService';
import { convertPdfToImages, createPdfFromImages } from './services/pdfService';
import { GithubIcon } from './components/GithubIcon';

export default function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cleanedPdfUrl, setCleanedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');

  useEffect(() => {
    // Cleanup object URL to prevent memory leaks
    return () => {
      if (cleanedPdfUrl) {
        URL.revokeObjectURL(cleanedPdfUrl);
      }
    };
  }, [cleanedPdfUrl]);
  
  const resetState = () => {
    setPdfFile(null);
    setProcessingStatus('');
    setProgress(0);
    setIsLoading(false);
    if (cleanedPdfUrl) {
      URL.revokeObjectURL(cleanedPdfUrl);
    }
    setCleanedPdfUrl(null);
    setError(null);
    setOriginalFileName('');
  };

  const handleFileSelect = (file: File) => {
    resetState();
    setPdfFile(file);
    setOriginalFileName(file.name);
  };

  const processPDF = useCallback(async () => {
    if (!pdfFile) return;

    setIsLoading(true);
    setError(null);
    setCleanedPdfUrl(null);
    setProgress(0);

    try {
      setProcessingStatus('Step 1/4: Converting PDF pages to images...');
      const imagePages = await convertPdfToImages(pdfFile);
      const totalPages = imagePages.length;
      setProgress(25);

      setProcessingStatus(`Step 2/4: Removing handwriting from ${totalPages} pages...`);
      const cleanedImagePages: string[] = [];
      for (let i = 0; i < totalPages; i++) {
        setProcessingStatus(`Step 2/4: Removing handwriting... (Page ${i + 1}/${totalPages})`);
        // Remove the 'data:image/png;base64,' prefix for the API
        const base64Data = imagePages[i].split(',')[1];
        const cleanedData = await cleanImageWithGemini(base64Data);
        cleanedImagePages.push(`data:image/png;base64,${cleanedData}`);
        setProgress(25 + Math.round(((i + 1) / totalPages) * 50));
      }

      setProcessingStatus('Step 3/4: Assembling clean PDF...');
      const pdfBytes = await createPdfFromImages(cleanedImagePages);
      setProgress(95);

      setProcessingStatus('Step 4/4: Creating download link...');
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      setCleanedPdfUrl(url);
      setProgress(100);
      setProcessingStatus('Done!');

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Processing failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [pdfFile]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">
            PDF Handwriting Remover
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Upload a PDF with handwritten notes, and let AI clean it for you.
          </p>
        </header>

        <main className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-10 space-y-8">
          {!pdfFile && <FileUpload onFileSelect={handleFileSelect} />}
          
          {pdfFile && (
            <div className='text-center'>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                Selected File: <span className="font-bold text-blue-500">{originalFileName}</span>
              </p>
              <button
                onClick={resetState}
                className="mt-2 text-sm text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Choose a different file
              </button>
            </div>
          )}

          {pdfFile && !isLoading && !cleanedPdfUrl && (
            <div className="flex justify-center">
              <button
                onClick={processPDF}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove Handwriting
              </button>
            </div>
          )}

          {isLoading && <ProcessingView status={processingStatus} progress={progress} />}
          
          {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
          
          {cleanedPdfUrl && (
            <DownloadSection
              url={cleanedPdfUrl}
              originalFileName={originalFileName}
            />
          )}
        </main>
        <footer className="text-center mt-8 text-gray-500 dark:text-gray-400">
          <a href="https://github.com/google/genai-js" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-blue-500 transition-colors">
            <GithubIcon className="w-5 h-5" />
            <span>Powered by Gemini API</span>
          </a>
        </footer>
      </div>
    </div>
  );
}
