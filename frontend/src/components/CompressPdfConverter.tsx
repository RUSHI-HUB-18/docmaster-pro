'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Minimize, 
  FileCheck, 
  Download,
  RefreshCw,
  FileText,
  Sparkles,
  Zap,
  TrendingDown
} from 'lucide-react';
import ConverterShell from '@/components/ConverterShell';
import { formatSize } from '@/lib/utils';

let pdfLib: any = null;
let pdfjsLib: any = null;

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
    sizeSaving: '~35-45% saved',
    icon: Zap,
    isRecommended: true
  },
  {
    level: 'strong',
    name: 'Strong Compression',
    description: 'Max size reduction, lower image resolution. Best when file weight is critical.',
    sizeSaving: '~55-65% saved',
    icon: TrendingDown
  }
];

export default function CompressPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'basic' | 'medium' | 'strong'>('medium');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ 
    downloadUrl: string; 
    name: string; 
    originalSize: number; 
    compressedSize: number; 
  } | null>(null);

  // Lazy load libraries
  useEffect(() => {
    const loadLibs = async () => {
      pdfLib = await import('pdf-lib');
      const pdfjs = await import('pdfjs-dist');
      pdfjsLib = pdfjs;
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    };
    loadLibs();
  }, []);

  const handleFilesSelected = (selected: File[]) => {
    if (selected.length > 0) {
      setError(null);
      setFile(selected[0]);
    }
  };

  const resetTool = () => {
    if (successResult?.downloadUrl) {
      URL.revokeObjectURL(successResult.downloadUrl);
    }
    setFile(null);
    setSelectedLevel('medium');
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setSuccessResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setProgress(5);
    setCurrentTask('Reading PDF metadata...');

    try {
      if (!pdfLib) {
        pdfLib = await import('pdf-lib');
      }
      if (!pdfjsLib) {
        const pdfjs = await import('pdfjs-dist');
        pdfjsLib = pdfjs;
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }

      setProgress(15);
      setCurrentTask('Reading document pages...');
      const arrayBuffer = await file.arrayBuffer();

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const compressedPdf = await pdfLib.PDFDocument.create();

      // Configure compression scale & quality
      let scale = 1.5;
      let quality = 0.7;

      if (selectedLevel === 'strong') {
        scale = 1.0;
        quality = 0.45;
      } else if (selectedLevel === 'basic') {
        scale = 2.0;
        quality = 0.85;
      }

      for (let i = 1; i <= numPages; i++) {
        setCurrentTask(`Compressing page ${i} of ${numPages}...`);
        setProgress(15 + Math.round((i / numPages) * 70));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        // Draw to offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        // Fill background color in case of transparent background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Compress image using low quality JPEG
        const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
        const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());

        // Embed the compressed page image in new PDF document
        const embeddedImg = await compressedPdf.embedJpg(imgBytes);
        const newPage = compressedPdf.addPage([viewport.width / scale, viewport.height / scale]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: newPage.getWidth(),
          height: newPage.getHeight(),
        });
      }

      setProgress(90);
      setCurrentTask('Compiling compressed output...');
      const compressedBytes = await compressedPdf.save();

      setProgress(98);
      setCurrentTask('Generating file link...');
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const outputName = file.name.replace('.pdf', '') + '_compressed.pdf';

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputName,
        originalSize: file.size,
        compressedSize: blob.size,
      });

      // Dispatch global history event
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: 'compress_' + Math.random().toString(36).substring(2, 11),
          name: outputName,
          tool: 'Compress PDF',
          size: blob.size,
          downloadUrl,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(processedEvent);
      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to compress PDF. Please verify the document is readable.');
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
      actionButtonLabel="Compress PDF"
      actionButtonIcon={<Minimize className="w-4 h-4" />}
      onAction={handleCompress}
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
              <h3 className="text-xl font-bold text-white mb-2">PDF Compressed Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Reduced file size by{' '}
                <span className="text-green-400 font-bold">
                  {Math.max(0, Math.round(((successResult.originalSize - successResult.compressedSize) / successResult.originalSize) * 100))}%
                </span>
                . Download the optimized PDF below.
              </p>
            </div>
            
            {/* Compression Comparison Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-grow text-left">
                  <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Optimized PDF Document</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-white/5">
                <div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Original Size</div>
                  <div className="text-slate-300 font-semibold mt-0.5">{formatSize(successResult.originalSize)}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Compressed Size</div>
                  <div className="text-green-400 font-bold mt-0.5">{formatSize(successResult.compressedSize)}</div>
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
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Compression Quality Level
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {COMPRESSION_LEVELS.map((level) => {
              const Icon = level.icon;
              return (
                <button
                  key={level.level}
                  onClick={() => setSelectedLevel(level.level as any)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 relative ${
                    selectedLevel === level.level
                      ? 'bg-accent-primary/10 border-accent-primary/30 text-white'
                      : 'bg-white/2 border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {level.isRecommended && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-bold bg-accent-secondary text-white border border-background shadow-md">
                      Recommended
                    </span>
                  )}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                    selectedLevel === level.level
                      ? 'bg-accent-primary'
                      : 'bg-white/5'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">{level.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-normal mb-1.5">{level.description}</p>
                    <span className="text-[10px] font-bold text-accent-primary">{level.sizeSaving}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Details */}
        {file && (
          <div className="flex flex-col gap-3 rounded-2xl bg-white/2 border border-white/5 p-4 text-xs text-slate-400">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="font-bold">File Name</span>
              <span className="text-white truncate max-w-[200px] font-semibold">{file.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Original File Size</span>
              <span className="text-white font-semibold">{formatSize(file.size)}</span>
            </div>
          </div>
        )}
      </div>
    </ConverterShell>
  );
}
