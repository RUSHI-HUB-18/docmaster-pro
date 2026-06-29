import * as pdfjsLib from 'pdfjs-dist';

// Centralize the worker setup to point to the local file in the public directory
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export { pdfjsLib };
