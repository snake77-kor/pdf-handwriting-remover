
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFPageProxy } from 'pdfjs-dist';

// Set up the PDF.js worker using the local npm package (Vite-friendly)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

/**
 * Converts a PDF file into an array of base64 encoded image strings.
 * @param file The PDF file to convert.
 * @returns A promise that resolves to an array of data URLs (base64 strings).
 */
export async function convertPdfToImages(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  const imagePromises: Promise<string>[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i) as PDFPageProxy;
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
        throw new Error('Could not get canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    } as any;

    await page.render(renderContext).promise;
    imagePromises.push(Promise.resolve(canvas.toDataURL('image/png')));
  }

  return Promise.all(imagePromises);
}

/**
 * Creates a new PDF document from an array of image data URLs.
 * @param images An array of data URLs (base64 strings) for each page.
 * @returns A promise that resolves to the PDF bytes as a Uint8Array.
 */
export async function createPdfFromImages(images: string[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const imageUrl of images) {
    const pngImageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(pngImageBytes);

    const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngImage.width,
      height: pngImage.height,
    });
  }

  return pdfDoc.save();
}
