'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Combine, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  Loader2, 
  FileCheck, 
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import ToolPageLayout from '@/components/ToolPageLayout';
import { API_URL } from '@/lib/config';

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ downloadUrl: string; name: string; size: number } | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    setFiles(prev => [...prev, ...newFiles]);
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
    setFiles([]);
    setProcessing(false);
    setProgress(0);
    setError(null);
    setSuccessResult(null);
  };

  const processMerge = async () => {
    if (files.length < 2) {
      setError('Please upload at least 2 PDF files to merge.');
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress(15);

    const formData = new FormData();
    // Note: uploadId is generated server-side for security.
    // Do NOT send a client-generated uploadId — it would be ignored.

    // Append files in their current visual order
    files.forEach(file => {
      formData.append('files', file);
    });

    // Send the indexes order: [0, 1, 2, ...] since files are appended in current sorted order
    const orderArray = Array.from({ length: files.length }, (_, i) => i);
    formData.append('order', JSON.stringify(orderArray));

    try {
      setProgress(40);
      const response = await fetch(`${API_URL}/api/pdf/merge`, {
        method: 'POST',
        body: formData,
      });

      setProgress(80);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to merge PDF files.');
      }

      // Use the server-assigned uploadId (never trust a client-generated one)
      const uploadId = result.uploadId as string;

      setProgress(100);
      setSuccessResult({
        downloadUrl: result.downloadUrl,
        name: result.filename,
        size: result.size
      });

      // Dispatch event to update global DownloadCenter list
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: result.filename,
          tool: 'Merge',
          size: result.size,
          downloadUrl: result.downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

    } catch (err: any) {
      setError(err.message || 'An error occurred during merging.');
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ToolPageLayout
      toolPath="/merge"
      title="Merge PDF"
      description="Combine multiple PDF files into one. Arrange them in the exact order you need."
      icon="Combine"
      color="from-blue-500 to-indigo-600"
      badges={['Popular']}
    >
      {/* Main Box */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
        
        {/* Success Output */}
        {successResult ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10 gap-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <FileCheck className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Merge Completed!</h3>
              <p className="text-slate-400 text-xs">
                Your merged PDF is ready. Click download or merge another batch.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={`${API_URL}${successResult.downloadUrl}`}
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
          /* Processing Screen */
          <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
            <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
            <div>
              <h3 className="text-white font-bold text-base mb-1.5">Processing files...</h3>
              <p className="text-slate-500 text-xs">Merging and optimizing pages. Please wait.</p>
            </div>
            {/* Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        ) : files.length === 0 ? (
          /* Upload State */
          <DropZone
            onFilesSelected={handleFilesSelected}
            multiple={true}
            selectedFiles={files}
            onRemoveFile={removeFile}
          />
        ) : (
          /* Arrange & Manage State */
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Arrange files ({files.length})
              </span>
              <button
                onClick={() => setFiles([])}
                className="text-[11px] font-bold text-red-400 hover:text-red-300"
              >
                Clear all
              </button>
            </div>

            {/* List of Files */}
            <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
              <AnimatePresence>
                {files.map((file, idx) => (
                  <motion.div
                    key={`${file.name}-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-900/30 hover:bg-slate-900/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-6 h-6 rounded bg-accent-primary/10 text-accent-primary flex items-center justify-center text-xs font-extrabold">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white text-xs font-semibold truncate max-w-xs sm:max-w-md">
                          {file.name}
                        </h4>
                        <span className="text-[10px] text-slate-500">{formatSize(file.size)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveFile(idx, 'up')}
                        disabled={idx === 0}
                        className="w-8 h-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveFile(idx, 'down')}
                        disabled={idx === files.length - 1}
                        className="w-8 h-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFile(idx)}
                        className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-4">
              {/* Add More Files Mock Button */}
              <label className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-xs text-white font-bold cursor-pointer flex items-center gap-1.5 transition-colors">
                <Plus className="w-4 h-4" /> Add Files
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                  }}
                  className="hidden"
                />
              </label>

              {/* Process Button */}
              <button
                onClick={processMerge}
                className="px-6 py-2.5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center gap-1.5 shadow-lg shadow-accent-primary/10 transition-colors"
              >
                Merge PDFs <Combine className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
