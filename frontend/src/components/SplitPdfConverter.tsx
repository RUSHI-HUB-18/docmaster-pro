'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  Plus, 
  Trash2, 
  FileCheck, 
  Download,
  RefreshCw,
  FileText,
  Layers
} from 'lucide-react';
import ConverterShell from '@/components/ConverterShell';
import { formatSize } from '@/lib/utils';
import dynamic from 'next/dynamic';

let pdfLib: any = null;
let JSZip: any = null;

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

interface PageRange {
  start: number;
  end: number;
}

export default function SplitPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'all' | 'ranges'>('all');
  const [ranges, setRanges] = useState<PageRange[]>([{ start: 1, end: 1 }]);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ 
    downloadUrl: string; 
    name: string; 
    size: number; 
    isZip: boolean;
  } | null>(null);

  // Lazy load modules
  useEffect(() => {
    Promise.all([
      import('pdf-lib'),
      import('jszip')
    ]).then(([pdfLibModule, jszipModule]) => {
      pdfLib = pdfLibModule;
      JSZip = jszipModule.default;
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
      const pages = pdf.getPageCount();
      setPageCount(pages);
      setRanges([{ start: 1, end: Math.min(pages, 1) }]);
      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load PDF file. It may be password-protected or corrupted.');
      setFile(null);
      setProcessing(false);
    }
  };

  const addRange = () => {
    setRanges(prev => [...prev, { start: 1, end: 1 }]);
  };

  const removeRange = (idx: number) => {
    if (ranges.length === 1) return;
    setRanges(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRange = (idx: number, field: 'start' | 'end', val: number) => {
    const clampedVal = Math.max(1, Math.min(pageCount, val));
    setRanges(prev => prev.map((r, i) => {
      if (i === idx) {
        return { ...r, [field]: clampedVal };
      }
      return r;
    }));
  };

  const resetTool = () => {
    if (successResult?.downloadUrl) {
      URL.revokeObjectURL(successResult.downloadUrl);
    }
    setFile(null);
    setMode('all');
    setRanges([{ start: 1, end: 1 }]);
    setPageCount(0);
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setSuccessResult(null);
  };

  const handleSplit = async () => {
    if (!file) return;

    // Validation for ranges
    if (mode === 'ranges') {
      for (const range of ranges) {
        if (range.start > range.end) {
          setError(`Invalid range: start page (${range.start}) cannot be greater than end page (${range.end}).`);
          return;
        }
      }
    }

    setProcessing(true);
    setError(null);
    setProgress(10);
    setCurrentTask('Loading compiler libraries...');

    try {
      if (!pdfLib) pdfLib = await import('pdf-lib');
      if (!JSZip) JSZip = (await import('jszip')).default;

      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await pdfLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      let downloadUrl = '';
      let outputName = '';
      let isZipOutput = false;
      let finalBlobSize = 0;

      if (mode === 'all') {
        setProgress(30);
        setCurrentTask('Splitting all pages...');
        const zip = new JSZip();
        const pages = srcPdf.getPageCount();

        for (let i = 0; i < pages; i++) {
          setCurrentTask(`Extracting page ${i + 1} of ${pages}...`);
          setProgress(30 + Math.round((i / pages) * 50));

          const newPdf = await pdfLib.PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(srcPdf, [i]);
          newPdf.addPage(copiedPage);

          const pdfBytes = await newPdf.save();
          const pageNumString = String(i + 1).padStart(3, '0');
          zip.file(`${file.name.replace('.pdf', '')}_page_${pageNumString}.pdf`, pdfBytes);
        }

        setCurrentTask('Creating ZIP archive...');
        setProgress(85);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadUrl = URL.createObjectURL(zipBlob);
        outputName = `${file.name.replace('.pdf', '')}_pages.zip`;
        isZipOutput = true;
        finalBlobSize = zipBlob.size;
      } else {
        // Ranges mode
        if (ranges.length === 1) {
          // Single range -> outputs a single PDF file
          setProgress(40);
          setCurrentTask('Extracting page range...');
          
          const newPdf = await pdfLib.PDFDocument.create();
          const range = ranges[0];
          const indices = Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start - 1 + i);
          
          const copiedPages = await newPdf.copyPages(srcPdf, indices);
          copiedPages.forEach((page: any) => newPdf.addPage(page));
          
          setProgress(85);
          const pdfBytes = await newPdf.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          downloadUrl = URL.createObjectURL(blob);
          outputName = `${file.name.replace('.pdf', '')}_pages_${range.start}-${range.end}.pdf`;
          finalBlobSize = blob.size;
        } else {
          // Multiple ranges -> outputs a ZIP file containing the split PDFs
          setProgress(30);
          setCurrentTask('Extracting multiple ranges...');
          const zip = new JSZip();
          const totalRanges = ranges.length;

          for (let i = 0; i < totalRanges; i++) {
            const range = ranges[i];
            setCurrentTask(`Extracting range ${range.start}-${range.end} (${i + 1}/${totalRanges})...`);
            setProgress(30 + Math.round((i / totalRanges) * 50));

            const newPdf = await pdfLib.PDFDocument.create();
            const indices = Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start - 1 + i);
            
            const copiedPages = await newPdf.copyPages(srcPdf, indices);
            copiedPages.forEach((page: any) => newPdf.addPage(page));

            const pdfBytes = await newPdf.save();
            zip.file(`${file.name.replace('.pdf', '')}_range_${range.start}-${range.end}.pdf`, pdfBytes);
          }

          setCurrentTask('Creating ZIP archive...');
          setProgress(85);
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          downloadUrl = URL.createObjectURL(zipBlob);
          outputName = `${file.name.replace('.pdf', '')}_ranges.zip`;
          isZipOutput = true;
          finalBlobSize = zipBlob.size;
        }
      }

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputName,
        size: finalBlobSize,
        isZip: isZipOutput
      });

      // Dispatch global history event
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: 'split_' + Math.random().toString(36).substring(2, 11),
          name: outputName,
          tool: 'Split PDF',
          size: finalBlobSize,
          downloadUrl,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(processedEvent);
      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to split PDF. Please ensure the file is not corrupted.');
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
      actionButtonLabel={mode === 'all' ? 'Split All Pages' : 'Extract Ranges'}
      actionButtonIcon={<Scissors className="w-4 h-4" />}
      onAction={handleSplit}
      isActionDisabled={!file}
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
              <h3 className="text-xl font-bold text-white mb-2">PDF Split Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Your PDF has been split and is ready to download.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  {successResult.isZip ? 'ZIP Archive' : 'Split PDF Document'} · {formatSize(successResult.size)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={successResult.downloadUrl}
                download={successResult.name}
                className="flex-grow py-3 px-5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download Result
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
            Document Preview
          </h3>
          <div className="border border-white/5 bg-black/10 rounded-2xl p-4 max-h-[600px] overflow-y-auto">
            {file && (
              <PdfPreview
                file={file}
                allowRotation={false}
                allowSelection={false}
                allowDeletion={false}
              />
            )}
          </div>
        </div>

        {/* Right: Settings */}
        <div className="flex flex-col gap-6">
          {/* Mode Selector */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Split Mode
            </h3>
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setMode('all')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === 'all'
                    ? 'bg-accent-primary text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Split all pages
              </button>
              <button
                onClick={() => setMode('ranges')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  mode === 'ranges'
                    ? 'bg-accent-primary text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Custom Ranges
              </button>
            </div>
          </div>

          {/* Settings depending on mode */}
          {mode === 'all' ? (
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
              <div className="flex items-center gap-2 text-accent-primary font-bold">
                <Layers className="w-4 h-4" /> Extract All
              </div>
              <p className="text-[11px]">
                Every page of this PDF will be saved as an individual PDF document. You will receive a single ZIP archive containing all pages.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Page Ranges
                </h3>
                <button
                  onClick={addRange}
                  className="py-1 px-2.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-[10px] text-white font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Range
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {ranges.map((range, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white/3 border border-white/5 p-3 rounded-xl"
                  >
                    <div className="flex-1 flex items-center gap-2 text-xs">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">From Page</label>
                        <input
                          type="number"
                          min={1}
                          max={pageCount}
                          value={range.start}
                          onChange={(e) => updateRange(idx, 'start', parseInt(e.target.value) || 1)}
                          className="input-premium py-1 px-2 text-xs w-full text-center"
                        />
                      </div>
                      <span className="text-slate-500 self-end mb-1.5">-</span>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase">To Page</label>
                        <input
                          type="number"
                          min={1}
                          max={pageCount}
                          value={range.end}
                          onChange={(e) => updateRange(idx, 'end', parseInt(e.target.value) || 1)}
                          className="input-premium py-1 px-2 text-xs w-full text-center"
                        />
                      </div>
                    </div>
                    {ranges.length > 1 && (
                      <button
                        onClick={() => removeRange(idx)}
                        className="p-2 rounded-lg border border-white/5 bg-white/2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors self-end mb-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
