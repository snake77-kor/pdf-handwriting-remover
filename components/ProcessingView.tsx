
import React from 'react';

interface ProcessingViewProps {
  status: string;
  progress: number;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ status, progress }) => {
  return (
    <div className="space-y-4 text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="font-semibold text-lg text-gray-700 dark:text-gray-300">{status}</p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-teal-400 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-2xl font-bold text-blue-500">{progress}%</p>
    </div>
  );
};
