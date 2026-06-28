'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  FileText,
  Sliders,
  Clock,
  Zap,
  ChevronRight,
  Eye,
  Presentation
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import { pptxToHtml } from '@jvmr/pptx-to-html';

export default function PptToPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [slidesHtml, setSlidesHtml] = useState<string[]>([]);
  const [successResult, setSuccessResult] = useState<{
    downloadUrl: string;
    name: string;
    size: number;
    slideCount: number;
  } | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = async (selected: File[]) => {
    if (selected.length === 0) return;
    const selectedFile = selected[0];

    // Basic extension check
    if (!selectedFile.name.endsWith('.pptx')) {
      setError('Only .pptx PowerPoint presentations are supported at this time.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setProcessing(true);
    setCurrentTask('Parsing PowerPoint deck...');
    setProgress(20);

    try {
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) resolve(e.target.result as ArrayBuffer);
          else reject(new Error('Failed to read file.'));
        };
        reader.onerror = () => reject(new Error('FileReader error.'));
        reader.readAsArrayBuffer(selectedFile);
      });

      setProgress(50);
      setCurrentTask('Generating slide components...');

      // Convert presentation structures to HTML snippets in-browser
      const slides = await pptxToHtml(arrayBuffer, {
        width: 960,
        height: 540,
        scaleToFit: true
      });

      if (!slides || slides.length === 0) {
        throw new Error('This presentation contains no valid slides.');
      }

      setSlidesHtml(slides);
      setProgress(100);
      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse PowerPoint. Make sure the file is not corrupted.');
      setFile(null);
      setProcessing(false);
    }
  };

  const handleConvertToPdf = async () => {
    if (!file || !previewRef.current) return;

    setProcessing(true);
    setError(null);
    setProgress(20);
    setCurrentTask('Initializing PDF printer...');

    try {
      // Dynamically load html2pdf.js client-side only
      const html2pdf = (await import('html2pdf.js')).default;

      setProgress(50);
      setCurrentTask('Formatting landscape presentation pages...');

      const opt = {
        margin: 0,
        filename: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false 
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
      };

      setProgress(80);
      setCurrentTask('Compiling slideshow pages...');

      const pdfBlob = await html2pdf().from(previewRef.current).set(opt as any).output('blob');
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const outputFilename = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputFilename,
        size: pdfBlob.size,
        slideCount: slidesHtml.length
      });

      // Dispatch global history event
      const uploadId = 'pptx_' + Math.random().toString(36).substring(2, 11);
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: outputFilename,
          tool: 'PPT to PDF',
          size: pdfBlob.size,
          downloadUrl: downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to compile PDF document.');
      setProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setSlidesHtml([]);
    setError(null);
  };

  const resetTool = () => {
    setFile(null);
    setSlidesHtml([]);
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setSuccessResult(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {successResult ? (
          /* SUCCESS SCREEN */
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
              <h3 className="text-xl font-bold text-white mb-2">Presentation Converted!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Successfully converted {successResult.slideCount} slides into a landscape PDF document. Download below.
              </p>
            </div>

            {/* File Info Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  PDF Presentation · {formatSize(successResult.size)}
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
        ) : processing ? (
          /* CONVERTING STATE SCREEN */
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-5 text-center"
          >
            <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
            <div>
              <h3 className="text-white font-bold text-base mb-1">{currentTask}</h3>
              <p className="text-slate-500 text-xs">Generating pages locally inside the browser. Do not close this tab.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        ) : !file ? (
          /* UPLOAD ZONE */
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DropZone
              onFilesSelected={handleFilesSelected}
              multiple={false}
              selectedFiles={[]}
              onRemoveFile={() => {}}
            />
          </motion.div>
        ) : (
          /* CONFIGURATION / PREVIEW VIEW */
          <motion.div
            key="configure"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Preview Column (Slideshow Viewer) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-orange-400" /> Slides Preview ({slidesHtml.length} Slides)
              </h3>
              
              {/* Slides compilation print wrapper */}
              <div className="border border-white/5 bg-black/35 rounded-2xl p-4 sm:p-8 max-h-[600px] overflow-y-auto flex flex-col gap-6 items-center">
                <div ref={previewRef} className="w-full flex flex-col gap-6 items-center pptx-print-wrapper">
                  {slidesHtml.map((slideHtml, idx) => (
                    <div 
                      key={idx}
                      className="w-full max-w-[800px] aspect-[16/9] bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 text-left relative slide-page"
                      dangerouslySetInnerHTML={{ __html: slideHtml }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Settings Sidebar */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Presentation Settings
                </h3>

                <div className="flex flex-col gap-3 rounded-2xl bg-white/2 border border-white/5 p-4 text-xs text-slate-400">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="font-bold">File Name</span>
                    <span className="text-white truncate max-w-[150px] font-semibold">{file.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="font-bold">Original Size</span>
                    <span className="text-white font-semibold">{formatSize(file.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Output Orientation</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Presentation className="w-3.5 h-3.5" /> Landscape
                    </span>
                  </div>
                </div>
              </div>

              {/* Informational Badge */}
              <div className="mt-auto p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
                <div className="flex items-center gap-2 text-accent-primary font-bold">
                  <Clock className="w-4 h-4" /> 100% Client-Side Processing
                </div>
                <p className="text-[11px] text-slate-400">
                  Your PowerPoint deck is parsed and rendered entirely inside your browser. No files are uploaded to any server, offering absolute privacy.
                </p>
              </div>

              {/* Errors Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Control Action Buttons */}
              <div className="border-t border-white/5 pt-4 flex items-center gap-3">
                <button
                  onClick={removeFile}
                  className="py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-xs text-white font-bold transition-all shrink-0"
                >
                  Change File
                </button>
                <button
                  onClick={handleConvertToPdf}
                  className="flex-grow py-2.5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-accent-primary/10 transition-all text-xs"
                >
                  Convert to PDF <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS scope for printing layout styling of slides */}
      <style jsx global>{`
        .slide-page {
          page-break-after: always;
          break-after: page;
          box-sizing: border-box;
        }
        
        /* Ensure absolute positioning works correctly for children elements inside converted slide HTML */
        .slide-page > div {
          position: absolute !important;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
