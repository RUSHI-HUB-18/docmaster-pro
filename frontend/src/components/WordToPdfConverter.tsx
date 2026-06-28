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
  FileCode,
  Sparkles,
  ChevronRight,
  Eye,
  Clock
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import mammoth from 'mammoth';

export default function WordToPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [successResult, setSuccessResult] = useState<{
    downloadUrl: string;
    name: string;
    size: number;
  } | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = async (selected: File[]) => {
    if (selected.length === 0) return;
    const selectedFile = selected[0];

    // Basic file extension check
    if (!selectedFile.name.endsWith('.docx')) {
      setError('Only .docx files are supported at this time.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setProcessing(true);
    setCurrentTask('Parsing Word document...');
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

      setProgress(60);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      setHtmlContent(result.value || '<p className="text-slate-400">Empty document</p>');
      setProgress(100);
      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse Word document. Please ensure the file is not corrupted.');
      setFile(null);
      setProcessing(false);
    }
  };

  const handleConvertToPdf = async () => {
    if (!file || !previewRef.current) return;

    setProcessing(true);
    setError(null);
    setProgress(20);
    setCurrentTask('Initializing PDF compiler...');

    try {
      // Dynamically load html2pdf.js client-side only
      const html2pdf = (await import('html2pdf.js')).default;
      
      setProgress(50);
      setCurrentTask('Rendering print layout pages...');

      const opt = {
        margin: 0.5, // standard margins
        filename: `${file.name.replace(/\.[^/.]+$/, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2.2, 
          useCORS: true,
          logging: false 
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      setProgress(80);
      setCurrentTask('Compiling PDF structure...');

      // Generate the PDF blob
      const pdfBlob = await html2pdf().from(previewRef.current).set(opt as any).output('blob');
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const outputFilename = `${file.name.replace(/\.[^/.]+$/, '')}.pdf`;

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputFilename,
        size: pdfBlob.size
      });

      // Dispatch global history event
      const uploadId = 'docx_' + Math.random().toString(36).substring(2, 11);
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: outputFilename,
          tool: 'Word to PDF',
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
    setHtmlContent('');
    setError(null);
  };

  const resetTool = () => {
    setFile(null);
    setHtmlContent('');
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
              <h3 className="text-xl font-bold text-white mb-2">Word Converted Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Your document has been compiled into a high-quality PDF in-browser. Download it below.
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
                  PDF Document · {formatSize(successResult.size)}
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
              <p className="text-slate-500 text-xs">Converting Word formatting to page layout. Do not close this tab.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
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
            {/* Left Preview Column (Representing Paper Sheet) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-400" /> Print Preview
              </h3>
              
              <div className="border border-white/5 bg-black/35 rounded-2xl p-4 sm:p-8 max-h-[600px] overflow-y-auto flex justify-center">
                {/* Simulated Paper A4 Layout */}
                <div 
                  ref={previewRef}
                  className="w-full max-w-[800px] bg-white text-slate-900 shadow-2xl p-8 sm:p-12 rounded-lg border border-slate-200 text-left word-preview leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}
                />
              </div>
            </div>

            {/* Right Control Settings Column */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Document Settings
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
                    <span className="font-bold">Paper Format</span>
                    <span className="text-white font-semibold">US Letter (Standard)</span>
                  </div>
                </div>
              </div>

              {/* Informational Badge */}
              <div className="mt-auto p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
                <div className="flex items-center gap-2 text-accent-primary font-bold">
                  <Clock className="w-4 h-4" /> 100% Secure & Client-Side
                </div>
                <p className="text-[11px] text-slate-400">
                  Your document conversion is processed directly inside your browser. No files are uploaded to any server, guaranteeing complete privacy and zero data leakage.
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

      {/* Global CSS scope for printing layout styling of Mammoth rendered output */}
      <style jsx global>{`
        .word-preview p {
          margin-bottom: 1rem;
          color: #334155;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .word-preview h1,
        .word-preview h2,
        .word-preview h3,
        .word-preview h4 {
          color: #0f172a;
          font-weight: 800;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .word-preview h1 { font-size: 1.75rem; border-b: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
        .word-preview h2 { font-size: 1.4rem; }
        .word-preview h3 { font-size: 1.2rem; }
        .word-preview ul, .word-preview ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
          color: #334155;
          font-size: 0.95rem;
        }
        .word-preview ul { list-style-type: disc; }
        .word-preview ol { list-style-type: decimal; }
        .word-preview li { margin-bottom: 0.25rem; }
        .word-preview table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.9rem;
        }
        .word-preview th,
        .word-preview td {
          border: 1px solid #cbd5e1;
          padding: 10px 12px;
          text-align: left;
        }
        .word-preview th {
          background-color: #f1f5f9;
          font-weight: 700;
          color: #1e293b;
        }
        .word-preview a {
          color: #2563eb;
          text-decoration: underline;
        }
        .word-preview img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}
