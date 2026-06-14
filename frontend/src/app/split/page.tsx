'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  Loader2, 
  FileCheck, 
  Download,
  AlertCircle,
  RefreshCw,
  Layers,
  Plus,
  Trash2
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { API_URL } from '@/lib/config';

const PdfPreview = dynamic(() => import('@/components/PdfPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 border border-white/5 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading document previewer...</span>
    </div>
  ),
});

interface PageRange {
  start: number;
  end: number;
}

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'all' | 'ranges'>('all');
  const [ranges, setRanges] = useState<PageRange[]>([{ start: 1, end: 1 }]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ downloadUrl: string; name: string; size: number; isZip: boolean } | null>(null);

  const handleFilesSelected = (selected: File[]) => {
    if (selected.length > 0) {
      setError(null);
      setFile(selected[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setRanges([{ start: 1, end: 1 }]);
  };

  const addRange = () => {
    setRanges(prev => [...prev, { start: 1, end: 1 }]);
  };

  const removeRange = (idx: number) => {
    if (ranges.length === 1) return;
    setRanges(prev => prev.filter((_, i) => i !== idx));
  };

  const updateRange = (idx: number, field: 'start' | 'end', val: number) => {
    setRanges(prev => prev.map((r, i) => {
      if (i === idx) {
        return { ...r, [field]: val };
      }
      return r;
    }));
  };

  const resetTool = () => {
    setFile(null);
    setMode('all');
    setRanges([{ start: 1, end: 1 }]);
    setProcessing(false);
    setProgress(0);
    setError(null);
    setSuccessResult(null);
  };

  const processSplit = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setProgress(20);

    const formData = new FormData();
    const uploadId = crypto.randomUUID();
    formData.append('uploadId', uploadId);
    formData.append('file', file);
    formData.append('mode', mode);

    if (mode === 'ranges') {
      // Basic range validation
      for (const range of ranges) {
        if (range.start <= 0 || range.end <= 0) {
          setError('Ranges must use positive page numbers starting at 1.');
          setProcessing(false);
          return;
        }
        if (range.start > range.end) {
          setError('Range start page cannot exceed end page.');
          setProcessing(false);
          return;
        }
      }
      formData.append('ranges', JSON.stringify(ranges));
    }

    try {
      setProgress(50);
      const response = await fetch(`${API_URL}/api/pdf/split`, {
        method: 'POST',
        body: formData,
      });

      setProgress(85);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to split PDF.');
      }

      setProgress(100);
      setSuccessResult({
        downloadUrl: result.downloadUrl,
        name: result.filename,
        size: result.size,
        isZip: result.isZip
      });

      // Dispatch event to update global DownloadCenter list
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: result.filename,
          tool: 'Split',
          size: result.size,
          downloadUrl: result.downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

    } catch (err: any) {
      setError(err.message || 'An error occurred during splitting.');
      setProcessing(false);
    }
  };

  return (
    <ToolPageLayout
      toolPath="/split"
      title="Split PDF"
      description="Extract specific page ranges or extract all pages as individual documents in a ZIP."
      icon="Scissors"
      color="from-pink-500 to-rose-600"
      badges={['Popular']}
    >
      {/* Main Container */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
        
        {successResult ? (
          /* Success Screen */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10 gap-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <FileCheck className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Split Completed!</h3>
              <p className="text-slate-400 text-xs">
                Your split {successResult.isZip ? 'ZIP archive' : 'PDF document'} is ready.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={`${API_URL}${successResult.downloadUrl}`}
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
        ) : processing ? (
          /* Processing Screen */
          <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
            <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
            <div>
              <h3 className="text-white font-bold text-base mb-1.5">Processing files...</h3>
              <p className="text-slate-500 text-xs">Extracting designated pages. Please wait.</p>
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
        ) : !file ? (
          /* Upload State */
          <DropZone
            onFilesSelected={handleFilesSelected}
            multiple={false}
            selectedFiles={[]}
            onRemoveFile={() => {}}
          />
        ) : (
          /* Interactive Configuration State */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Page Previews Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Document Preview
              </h3>
              <div className="border border-white/5 bg-black/10 rounded-2xl p-4 max-h-[600px] overflow-y-auto">
                <PdfPreview
                  file={file}
                  allowRotation={false}
                  allowSelection={false}
                  allowDeletion={false}
                />
              </div>
            </div>

            {/* Split Control Options Column */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Split Options
                </h3>
                
                {/* Mode Selectors */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1 border border-white/5 rounded-xl">
                  <button
                    onClick={() => setMode('all')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      mode === 'all'
                        ? 'bg-accent-primary text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Split Every Page
                  </button>
                  <button
                    onClick={() => setMode('ranges')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      mode === 'ranges'
                        ? 'bg-accent-primary text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Custom Ranges
                  </button>
                </div>
              </div>

              {/* Mode Specific Configurations */}
              <div className="flex-grow flex flex-col gap-4">
                {mode === 'all' ? (
                  <div className="p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-300 text-xs leading-relaxed flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-accent-primary font-bold">
                      <Layers className="w-4 h-4" /> Batch Splitting
                    </div>
                    <p>
                      Every single page of your document will be separated into its own PDF. You will receive a ZIP file containing all pages.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Define Page Ranges</span>
                      <button
                        onClick={addRange}
                        className="text-accent-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Range
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {ranges.map((range, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white/2 border border-white/5 p-2 rounded-xl"
                        >
                          <div className="flex-grow grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[9px] text-slate-500 block font-bold mb-0.5">FROM PAGE</span>
                              <input
                                type="number"
                                min={1}
                                value={range.start}
                                onChange={(e) => updateRange(idx, 'start', Number(e.target.value))}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 block font-bold mb-0.5">TO PAGE</span>
                              <input
                                type="number"
                                min={1}
                                value={range.end}
                                onChange={(e) => updateRange(idx, 'end', Number(e.target.value))}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
                              />
                            </div>
                          </div>
                          
                          <button
                            onClick={() => removeRange(idx)}
                            disabled={ranges.length === 1}
                            className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 disabled:opacity-20 flex items-center justify-center mt-3.5 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Notice */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-white/5 pt-4 flex items-center gap-3">
                <button
                  onClick={removeFile}
                  className="py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-xs text-white font-bold"
                >
                  Change File
                </button>
                <button
                  onClick={processSplit}
                  className="flex-grow py-2.5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-accent-primary/10 transition-colors text-xs"
                >
                  Split PDF <Scissors className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
