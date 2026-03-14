import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Required for pdf.js
import 'pdfjs-dist/build/pdf.min.js';
import type { GlobalWorkerOptionsType } from 'pdfjs-dist';

// Make sure to declare the global pdfjsLib object.
declare const pdfjsLib: GlobalWorkerOptionsType;
// The workerSrc must match the version of pdfjs-dist imported via the importmap.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@5.4.296/build/pdf.worker.min.js`;


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);