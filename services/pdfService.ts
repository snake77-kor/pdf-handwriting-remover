
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { PDFPageProxy, RenderParameters } from 'pdfjs-dist/types/src/display/api';

// This is a workaround for pdfjs-dist import issues in some environments.
// It assumes pdfjsLib is available globally, which we set up in index.tsx
declare const pdfjsLib: any;

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
    const page: PDFPageProxy = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
        throw new Error('Could not get canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext: RenderParameters = {
      canvasContext: context,
      viewport: viewport,
    };

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
