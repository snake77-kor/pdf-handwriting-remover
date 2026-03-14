
import React from 'react';

interface DownloadSectionProps {
  url: string;
  originalFileName: string;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ url, originalFileName }) => {
  const getCleanedFileName = () => {
    const parts = originalFileName.split('.');
    if (parts.length > 1) {
      parts.pop(); // remove extension
    }
    return `${parts.join('.')}_cleaned.pdf`;
  };

  return (
    <div className="text-center p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">Processing Complete!</h2>
      <p className="text-green-700 dark:text-green-300 mb-6">Your clean PDF is ready to download.</p>
      <a
        href={url}
        download={getCleanedFileName()}
        className="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700 transform hover:scale-105 transition-transform duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Clean PDF
      </a>
    </div>
  );
};
