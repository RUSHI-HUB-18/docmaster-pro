'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Minimize, 
  Loader2, 
  FileCheck, 
  Download,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  TrendingDown
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import ToolPageLayout from '@/components/ToolPageLayout';
import { API_URL } from '@/lib/config';

const COMPRESSION_LEVELS = [
  {
    level: 'basic',
    name: 'Basic Compression',
    description: 'High quality, large file size. Perfect if you only need minor optimization.',
    sizeSaving: '~15-20% saved',
    icon: Sparkles
  },
  {
    level: 'medium',
    name: 'Medium Compression',
    description: 'Recommended. Great balance of quality and size reduction for emails & web.',
    sizeSaving: '~30-40% saved',
    icon: Zap,
    isRecommended: true
  },
  {
    level: 'strong',
    name: 'Strong Compression',
    description: 'Max size reduction, lower image resolution. Best when file weight is critical.',
    sizeSaving: '~50-60% saved',
    icon: TrendingDown
  }
];

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'basic' | 'medium' | 'strong'>('medium');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ 
    downloadUrl: string; 
    name: string; 
    originalSize: number; 
    compressedSize: number; 
  } | null>(null);

  const handleFilesSelected = (selected: File[]) => {
    if (selected.length > 0) {
      setError(null);
      setFile(selected[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const resetTool = () => {
    setFile(null);
    setSelectedLevel('medium');
    setProcessing(false);
    setProgress(0);
    setError(null);
    setSuccessResult(null);
  };

  const processCompress = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setProgress(20);

    const formData = new FormData();
    const uploadId = crypto.randomUUID();
    formData.append('uploadId', uploadId);
    formData.append('file', file);
    formData.append('level', selectedLevel);

    try {
      setProgress(50);
      const response = await fetch(`${API_URL}/api/pdf/compress`, {
        method: 'POST',
        body: formData,
      });

      setProgress(85);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to compress PDF.');
      }

      setProgress(100);
      setSuccessResult({
        downloadUrl: result.downloadUrl,
        name: result.filename,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize
      });

      // Dispatch event to update global DownloadCenter list
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: result.filename,
          tool: 'Compress',
          size: result.compressedSize,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          downloadUrl: result.downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

    } catch (err: any) {
      setError(err.message || 'An error occurred during compression.');
      setProcessing(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ToolPageLayout
      toolPath="/compress"
      title="Compress PDF"
      description="Reduce the file size of your PDF while maintaining optimal visual quality."
      icon="Minimize"
      color="from-amber-500 to-orange-600"
      badges={['Popular']}
    >
      {/* Main Container */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
        
        {successResult ? (
          /* Success Screen */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 gap-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <FileCheck className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Compression Complete!</h3>
              <p className="text-slate-400 text-xs">
                Your optimized PDF is ready for download.
              </p>
            </div>

            {/* Comparison Metrics Chart */}
            <div className="w-full max-w-md bg-white/2 border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Original Size</span>
                <span>Compressed Size</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-bold text-white">
                <span className="w-20 text-left line-through text-slate-500">{formatSize(successResult.originalSize)}</span>
                
                {/* Horizontal Comparison Bar */}
                <div className="flex-grow h-3 bg-white/5 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                    style={{ width: `${Math.max(15, Math.round((successResult.compressedSize / successResult.originalSize) * 100))}%` }}
                  />
                </div>

                <span className="w-24 text-right text-green-400">
                  {formatSize(successResult.compressedSize)}
                </span>
              </div>

              <div className="text-center text-xs text-green-400 font-extrabold bg-green-500/5 py-2 rounded-xl border border-green-500/10">
                Saved {Math.round((1 - successResult.compressedSize / successResult.originalSize) * 100)}% of the file space!
              </div>
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
              <h3 className="text-white font-bold text-base mb-1.5">Compressing file...</h3>
              <p className="text-slate-500 text-xs">Applying stream filters and cleaning metadata. Please wait.</p>
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
          /* Settings Configuration State */
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Compression Level
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

            {/* Level Options Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMPRESSION_LEVELS.map((levelCard) => {
                const Icon = levelCard.icon;
                const isSelected = selectedLevel === levelCard.level;
                return (
                  <button
                    key={levelCard.level}
                    onClick={() => setSelectedLevel(levelCard.level as any)}
                    className={`p-5 rounded-2xl border text-left flex flex-col gap-3 relative overflow-hidden transition-all duration-300 ${
                      isSelected
                        ? 'border-accent-primary bg-accent-primary/5 shadow-lg shadow-accent-primary/5'
                        : 'border-white/5 bg-slate-900/20 hover:bg-slate-900/40 hover:border-white/10'
                    }`}
                  >
                    {levelCard.isRecommended && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent-primary/20 border border-accent-primary/30 text-[9px] font-extrabold text-accent-primary uppercase tracking-wider">
                        Recommended
                      </span>
                    )}

                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-accent-primary text-white' : 'bg-white/5 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div>
                      <h4 className="text-white font-bold text-xs mb-1">
                        {levelCard.name}
                      </h4>
                      <p className="text-slate-400 text-[10px] leading-relaxed mb-4">
                        {levelCard.description}
                      </p>
                    </div>

                    <span className={`text-[10px] font-extrabold mt-auto ${
                      isSelected ? 'text-accent-primary' : 'text-slate-500'
                    }`}>
                      {levelCard.sizeSaving}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Error Notice */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-4">
              <button
                onClick={processCompress}
                className="px-6 py-2.5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center gap-1.5 shadow-lg shadow-accent-primary/10 transition-colors text-xs"
              >
                Compress PDF <Minimize className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
