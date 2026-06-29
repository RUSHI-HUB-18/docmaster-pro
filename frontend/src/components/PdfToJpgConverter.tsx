'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Sliders,
  ChevronRight,
  Clock
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import ConverterShell from '@/components/ConverterShell';
import dynamic from 'next/dynamic';
import JSZip from 'jszip';

// Configure pdfjs worker dynamically from a public CDN
import { pdfjsLib } from '@/lib/pdfjs-setup';
import { formatSize } from '@/lib/utils';

// Dynamic-import PdfPreview to avoid SSR issues
const PdfPreview = dynamic(() => import('@/components/PdfPreview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 border border-white/5 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading document previewer...</span>
    </div>
  ),
});

export default function PdfToJpgConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    downloadUrl: string;
    name: string;
    size: number;
    pageCount: number;
  } | null>(null);

  // Conversion Settings
  const [quality, setQuality] = useState<'medium' | 'high' | 'ultra'>('high');
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');

  const handleFilesSelected = (selected: File[]) => {
    if (selected.length > 0) {
      setError(null);
      setFile(selected[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  const resetTool = () => {
    if (successResult?.downloadUrl) {
      URL.revokeObjectURL(successResult.downloadUrl);
    }
    setFile(null);
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setSuccessResult(null);
  };

  const processToJpg = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setProgress(0);
    setCurrentTask('Reading PDF file...');

    try {
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as ArrayBuffer);
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsArrayBuffer(file);
      });

      setCurrentTask('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      if (totalPages === 0) {
        throw new Error('This PDF document has no pages.');
      }

      const zip = new JSZip();
      
      // Map quality to rendering scale
      const scaleMap = {
        medium: 1.5,
        high: 2.0,
        ultra: 3.0,
      };
      const scale = scaleMap[quality];
      const imageFormat = format === 'png' ? 'image/png' : 'image/jpeg';
      const extension = format === 'png' ? 'png' : 'jpg';
      const qualityValue = format === 'png' ? undefined : 0.92; // high jpeg quality

      for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        const pageNum = pageIdx + 1;
        setCurrentTask(`Converting page ${pageNum} of ${totalPages}...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Offscreen canvas setup
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Failed to get 2D canvas context');
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        // Render page to canvas
        await page.render(renderContext).promise;

        // Convert canvas to Blob
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), imageFormat, qualityValue);
        });

        if (!blob) {
          throw new Error(`Failed to export page ${pageNum} as image.`);
        }

        // Pad page index for alphabetical sorting
        const paddedIndex = String(pageNum).padStart(3, '0');
        const pageName = `${file.name.replace(/\.[^/.]+$/, '')}_page_${paddedIndex}.${extension}`;
        
        zip.file(pageName, blob);
        setProgress(Math.round((pageNum / totalPages) * 100));
      }

      setCurrentTask('Packaging ZIP archive...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const outputFilename = `${file.name.replace(/\.[^/.]+$/, '')}_images.zip`;

      setSuccessResult({
        downloadUrl,
        name: outputFilename,
        size: zipBlob.size,
        pageCount: totalPages,
      });

      // Dispatch event to local Download Center history
      const uploadId = 'client_' + Math.random().toString(36).substring(2, 11);
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: outputFilename,
          tool: 'PDF to JPG',
          size: zipBlob.size,
          downloadUrl: downloadUrl,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(processedEvent);

      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during image conversion.');
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
      currentTask={currentTask || 'Converting PDF to images...'}
      error={error}
      successResult={successResult as any}
      onReset={resetTool}
      accept=".pdf"
      multiple={false}
      onFilesSelected={handleFilesSelected}
      actionButtonLabel="Convert PDF"
      onAction={processToJpg}
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
              <h3 className="text-xl font-bold text-white mb-2">Conversion Complete!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Successfully converted {successResult.pageCount} pages. Download the ZIP file containing your high-resolution images below.
              </p>
            </div>

            {/* File Info Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  ZIP Archive · {formatSize(successResult.size)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={successResult.downloadUrl}
                download={successResult.name}
                className="flex-grow py-3 px-5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download ZIP
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
        {/* Left Preview Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
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

        {/* Right Settings Column */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-primary" /> Settings
            </h3>

            <div className="flex flex-col gap-5">
              {/* Format Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Image Format</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1 border border-white/5 rounded-xl">
                  <button
                    onClick={() => setFormat('jpeg')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      format === 'jpeg'
                        ? 'bg-accent-primary text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    JPG (JPEG)
                  </button>
                  <button
                    onClick={() => setFormat('png')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      format === 'png'
                        ? 'bg-accent-primary text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    PNG (Lossless)
                  </button>
                </div>
              </div>

              {/* Quality Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Resolution Quality</label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'medium', title: 'Standard (1.5x)', desc: 'Optimized for screen share & speed' },
                    { id: 'high', title: 'High Definition (2.0x)', desc: 'Crisp images, ideal for presentations' },
                    { id: 'ultra', title: 'Ultra Quality (3.0x)', desc: 'Extremely detailed, larger file sizes' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setQuality(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                        quality === item.id
                          ? 'bg-accent-primary/10 border-accent-primary/30 text-white'
                          : 'bg-white/2 border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${quality === item.id ? 'bg-accent-primary animate-pulse' : 'bg-slate-600'}`} />
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-500 leading-normal pl-3.5">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Offline Processing Information Badge */}
          <div className="mt-auto p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent-primary font-bold">
              <Clock className="w-4 h-4" /> 100% Client-Side
            </div>
            <p className="text-[11px] text-slate-400">
              This tool runs entirely in your browser using local resources. Your files are never uploaded to any server, offering maximum privacy and unlimited file sizes.
            </p>
          </div>
        </div>
      </div>
    </ConverterShell>
  );
}
