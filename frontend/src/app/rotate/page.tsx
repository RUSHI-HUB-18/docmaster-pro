'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RotateCw, 
  Loader2, 
  FileCheck, 
  Download,
  AlertCircle,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { API_URL } from '@/lib/config';
import { formatSize } from '@/lib/utils';

const PdfPreview = dynamic(() => import('@/components/PdfPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 border border-white/5 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading document previewer...</span>
    </div>
  ),
});

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ downloadUrl: string; name: string; size: number } | null>(null);
  
  // Track page-specific degrees to send to backend
  const [pageRotations, setPageRotations] = useState<{ pageIndex: number; degrees: number }[]>([]);

  const handleFilesSelected = (selected: File[]) => {
    if (selected.length > 0) {
      setError(null);
      setFile(selected[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPageRotations([]);
  };

  const resetTool = () => {
    setFile(null);
    setPageRotations([]);
    setProcessing(false);
    setProgress(0);
    setError(null);
    setSuccessResult(null);
  };

  const handlePageRotationsChange = (rotations: { pageIndex: number; degrees: number }[]) => {
    setPageRotations(rotations);
  };

  const processRotate = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setProgress(20);

    const formData = new FormData();
    // uploadId is generated server-side for security — not sent by client
    formData.append('file', file);
    
    // We only send pages that actually have a rotation !== 0 to optimize the payload/backend work
    const activeRotations = pageRotations.filter(p => p.degrees % 360 !== 0);
    
    formData.append('rotations', JSON.stringify(activeRotations));

    try {
      setProgress(55);
      const response = await fetch(`${API_URL}/api/pdf/rotate`, {
        method: 'POST',
        body: formData,
      });

      setProgress(85);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to rotate PDF pages.');
      }

      // Use the server-assigned uploadId
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
          tool: 'Rotate',
          size: result.size,
          downloadUrl: result.downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

    } catch (err: any) {
      setError(err.message || 'An error occurred during rotation.');
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
      toolPath="/rotate"
      title="Rotate PDF"
      description="Rotate individual pages or the entire document clockwise or counterclockwise."
      icon="RotateCw"
      color="from-purple-500 to-violet-600"
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
              <h3 className="text-xl font-bold text-white mb-2">Rotation Completed!</h3>
              <p className="text-slate-400 text-xs">
                Your rotated PDF has been saved. Click download to fetch it.
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
              <h3 className="text-white font-bold text-base mb-1.5">Rotating pages...</h3>
              <p className="text-slate-500 text-xs">Saving structural rotations to file. Please wait.</p>
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
          <DropZone accept=".pdf"
            onFilesSelected={handleFilesSelected}
            multiple={false}
            selectedFiles={[]}
            onRemoveFile={() => {}}
          />
        ) : (
          /* Interactive Preview & Rotation State */
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Interactive Rotator
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  File: {file.name} ({formatSize(file.size)})
                </span>
              </div>
              <button
                onClick={removeFile}
                className="text-xs font-bold text-red-400 hover:text-red-300"
              >
                Change File
              </button>
            </div>

            {/* Rotator Panel */}
            <div className="flex flex-col gap-4">
              <p className="text-slate-400 text-xs leading-relaxed">
                Hover over any page to rotate it individually, or use the toolbar options below to rotate the entire document.
              </p>
              
              <div className="border border-white/5 bg-black/10 rounded-2xl p-6 min-h-[300px]">
                <PdfPreview
                  file={file}
                  onPageRotationsChange={handlePageRotationsChange}
                  allowRotation={true}
                  allowSelection={false}
                  allowDeletion={false}
                />
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Row */}
            <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-4">
              <button
                onClick={processRotate}
                className="px-6 py-2.5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center gap-1.5 shadow-lg shadow-accent-primary/10 transition-colors text-xs"
              >
                Apply Rotations <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
