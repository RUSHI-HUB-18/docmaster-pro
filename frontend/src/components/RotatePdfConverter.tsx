'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCw, 
  FileCheck, 
  Download,
  RefreshCw,
  FileText
} from 'lucide-react';
import ConverterShell from '@/components/ConverterShell';
import { formatSize } from '@/lib/utils';
import dynamic from 'next/dynamic';

let pdfLib: any = null;

// Lazy import PdfPreview to keep initial load lightweight
const PdfPreview = dynamic(() => import('@/components/PdfPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 border border-white/5 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading previewer...</span>
    </div>
  ),
});

export default function RotatePdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRotations, setPageRotations] = useState<{ pageIndex: number; degrees: number }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ 
    downloadUrl: string; 
    name: string; 
    size: number; 
  } | null>(null);

  // Lazy load pdf-lib
  useEffect(() => {
    import('pdf-lib').then(lib => {
      pdfLib = lib;
    });
  }, []);

  const handleFilesSelected = async (selected: File[]) => {
    if (selected.length === 0) return;
    const selectedFile = selected[0];
    
    setFile(selectedFile);
    setError(null);
    setProcessing(true);
    setCurrentTask('Reading PDF document page count...');

    try {
      if (!pdfLib) {
        pdfLib = await import('pdf-lib');
      }
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
      setPageRotations([]);
      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load PDF file. It may be password-protected or corrupted.');
      setFile(null);
      setProcessing(false);
    }
  };

  const handlePageRotationsChange = (rotations: { pageIndex: number; degrees: number }[]) => {
    setPageRotations(rotations);
  };

  const resetTool = () => {
    if (successResult?.downloadUrl) {
      URL.revokeObjectURL(successResult.downloadUrl);
    }
    setFile(null);
    setPageRotations([]);
    setPageCount(0);
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setSuccessResult(null);
  };

  const handleRotate = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setProgress(20);
    setCurrentTask('Preparing document...');

    try {
      if (!pdfLib) {
        pdfLib = await import('pdf-lib');
      }

      setProgress(40);
      setCurrentTask('Loading PDF bytes...');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      setProgress(60);
      setCurrentTask('Rotating page angles...');
      // We only rotate pages that actually have a rotation value
      pageRotations.forEach(({ pageIndex, degrees }) => {
        const page = pages[pageIndex];
        if (page) {
          const currentRotation = page.getRotation().angle;
          // Apply rotation angle (0, 90, 180, 270)
          page.setRotation(pdfLib.degrees((currentRotation + degrees) % 360));
        }
      });

      setProgress(85);
      setCurrentTask('Compiling rotated PDF...');
      const modifiedBytes = await pdfDoc.save();

      setProgress(95);
      setCurrentTask('Generating file link...');
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const outputName = file.name.replace('.pdf', '') + '_rotated.pdf';

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputName,
        size: blob.size,
      });

      // Dispatch global history event
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: 'rotate_' + Math.random().toString(36).substring(2, 11),
          name: outputName,
          tool: 'Rotate PDF',
          size: blob.size,
          downloadUrl,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(processedEvent);
      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to rotate PDF. Please ensure the file is not corrupted.');
      setProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (successResult?.downloadUrl) {
        URL.revokeObjectURL(successResult.downloadUrl);
      }
    };
  }, [successResult]);

  const activeRotations = pageRotations.filter(p => p.degrees % 360 !== 0);

  return (
    <ConverterShell
      files={file ? [file] : []}
      processing={processing}
      progress={progress}
      currentTask={currentTask}
      error={error}
      successResult={successResult as any}
      onReset={resetTool}
      accept=".pdf"
      multiple={false}
      onFilesSelected={handleFilesSelected}
      actionButtonLabel={`Rotate & Save PDF (${activeRotations.length} page${activeRotations.length !== 1 ? 's' : ''})`}
      actionButtonIcon={<RotateCw className="w-4 h-4" />}
      onAction={handleRotate}
      isActionDisabled={!file || activeRotations.length === 0}
      successComponent={
        successResult && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">PDF Rotated Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Applied rotations to {activeRotations.length} pages in the document. Download the rotated PDF below.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  Rotated PDF · {formatSize(successResult.size)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={successResult.downloadUrl}
                download={successResult.name}
                className="flex-grow py-3 px-5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download PDF
              </a>
              <button
                onClick={resetTool}
                className="py-3 px-5 rounded-xl font-bold border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </motion.div>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Preview */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Rotate Pages visually
          </h3>
          <div className="border border-white/5 bg-black/10 rounded-2xl p-4 max-h-[600px] overflow-y-auto">
            {file && (
              <PdfPreview
                file={file}
                allowRotation={true}
                allowSelection={false}
                allowDeletion={false}
                onPageRotationsChange={handlePageRotationsChange}
              />
            )}
          </div>
        </div>

        {/* Right: Side Panel */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-white/5 bg-white/2 p-4 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <RotateCw className="w-4 h-4 text-accent-primary" /> How to Rotate
            </h4>
            <p className="text-[11px]">
              Hover over a page preview inside the viewer, and click the rotate buttons to turn individual pages 90° clockwise or counter-clockwise.
            </p>
            <p className="text-[11px] mt-1">
              Once you have rotated the desired pages, click the <b>Rotate & Save PDF</b> button to apply the changes.
            </p>
          </div>

          {/* Details */}
          {file && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white/2 border border-white/5 p-4 text-xs text-slate-400">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold">File Name</span>
                <span className="text-white truncate max-w-[140px] font-semibold">{file.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold">Total Pages</span>
                <span className="text-white font-semibold">{pageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">File Size</span>
                <span className="text-white font-semibold">{formatSize(file.size)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConverterShell>
  );
}
