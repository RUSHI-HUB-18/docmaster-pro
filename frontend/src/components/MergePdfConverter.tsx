'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Combine, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  FileCheck, 
  Download,
  RefreshCw,
  FileText
} from 'lucide-react';
import ConverterShell from '@/components/ConverterShell';
import { formatSize } from '@/lib/utils';

let pdfLib: any = null;

export default function MergePdfConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ 
    downloadUrl: string; 
    name: string; 
    size: number; 
  } | null>(null);

  // Lazy import pdf-lib
  useEffect(() => {
    import('pdf-lib').then(lib => {
      pdfLib = lib;
    });
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    const validFiles = newFiles.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (validFiles.length < newFiles.length) {
      setError('Some files were ignored because they are not PDF documents.');
    }
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFiles(updated);
  };

  const resetTool = () => {
    if (successResult?.downloadUrl) {
      URL.revokeObjectURL(successResult.downloadUrl);
    }
    setFiles([]);
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setSuccessResult(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please upload at least 2 PDF files to merge.');
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress(10);
    setCurrentTask('Loading libraries...');

    try {
      if (!pdfLib) {
        pdfLib = await import('pdf-lib');
      }

      setProgress(30);
      setCurrentTask('Initializing output document...');
      const mergedPdf = await pdfLib.PDFDocument.create();

      const total = files.length;
      for (let i = 0; i < total; i++) {
        const file = files[i];
        setCurrentTask(`Loading "${file.name}" (${i + 1}/${total})...`);
        setProgress(30 + Math.round((i / total) * 50));

        const arrayBuffer = await file.arrayBuffer();
        const srcPdf = await pdfLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        
        setCurrentTask(`Copying pages from "${file.name}"...`);
        const pageIndices = srcPdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);
        
        copiedPages.forEach((page: any) => mergedPdf.addPage(page));
      }

      setProgress(85);
      setCurrentTask('Compiling merged PDF...');
      const mergedPdfBytes = await mergedPdf.save();
      
      setProgress(95);
      setCurrentTask('Creating download link...');
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const outputName = files[0].name.replace('.pdf', '') + '_merged.pdf';

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputName,
        size: blob.size,
      });

      // Dispatch global history event
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: 'merge_' + Math.random().toString(36).substring(2, 11),
          name: outputName,
          tool: 'Merge PDF',
          size: blob.size,
          downloadUrl,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(processedEvent);
      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to merge PDF files. Please ensure they are not password protected.');
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
      files={files}
      processing={processing}
      progress={progress}
      currentTask={currentTask}
      error={error}
      successResult={successResult as any}
      onReset={resetTool}
      accept=".pdf"
      multiple={true}
      onFilesSelected={handleFilesSelected}
      actionButtonLabel={`Merge ${files.length} PDF${files.length !== 1 ? 's' : ''}`}
      actionButtonIcon={<Combine className="w-4 h-4" />}
      onAction={handleMerge}
      isActionDisabled={files.length < 2}
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
              <h3 className="text-xl font-bold text-white mb-2">PDF Merged Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Combined {files.length} PDF files into a single document. Download it below.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  Merged PDF · {formatSize(successResult.size)}
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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Documents to Combine
          </h3>
          <label className="cursor-pointer py-1.5 px-3 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-[10px] text-white font-bold transition-all flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-accent-primary" /> Add PDF
            <input
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFilesSelected(Array.from(e.target.files));
                }
              }}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-all text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-extrabold text-slate-500 w-5 text-center text-[10px] tabular-nums">
                  {idx + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold truncate max-w-[200px] sm:max-w-[350px]">
                    {file.name}
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{formatSize(file.size)}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => moveFile(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-white/5 bg-white/2 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveFile(idx, 'down')}
                  disabled={idx === files.length - 1}
                  className="p-1.5 rounded-lg border border-white/5 bg-white/2 text-slate-400 hover:text-white disabled:opacity-20 transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-1.5 rounded-lg border border-white/5 bg-white/2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ml-1"
                  title="Remove File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ConverterShell>
  );
}
