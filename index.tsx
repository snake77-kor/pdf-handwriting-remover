import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// pdfjs-dist is loaded via importmap in index.html (CDN)
// Global pdfjsLib is available at runtime via importmap
declare const pdfjsLib: { GlobalWorkerOptions: { workerSrc: string } };


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