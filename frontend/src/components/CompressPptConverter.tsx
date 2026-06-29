'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  Sliders,
  Clock,
  Zap,
  TrendingDown,
  Presentation,
  ChevronRight
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import ConverterShell from '@/components/ConverterShell';
import JSZip from 'jszip';
import { formatSize } from '@/lib/utils';

export default function CompressPptConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'basic' | 'medium' | 'strong'>('medium');
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
    setLevel('medium');
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
    setCurrentTask('Reading PowerPoint file...');

    try {
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) resolve(e.target.result as ArrayBuffer);
          else reject(new Error('Failed to read file.'));
        };
        reader.onerror = () => reject(new Error('FileReader error.'));
        reader.readAsArrayBuffer(file);
      });

      setCurrentTask('Extracting PowerPoint package...');
      setProgress(15);

      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Locate all media files in ppt/media/
      const mediaFiles: { name: string; file: JSZip.JSZipObject }[] = [];
      zip.forEach((relativePath, fileEntry) => {
        if (
          relativePath.startsWith('ppt/media/') &&
          (relativePath.endsWith('.png') ||
            relativePath.endsWith('.jpg') ||
            relativePath.endsWith('.jpeg') ||
            relativePath.endsWith('.webp'))
        ) {
          mediaFiles.push({ name: relativePath, file: fileEntry });
        }
      });

      const totalMedia = mediaFiles.length;

      if (totalMedia > 0) {
        // Setup compression settings
        const settings = {
          basic: { maxSize: 1600, quality: 0.85 },
          medium: { maxSize: 1200, quality: 0.75 },
          strong: { maxSize: 800, quality: 0.60 }
        };
        const { maxSize, quality } = settings[level];

        for (let i = 0; i < totalMedia; i++) {
          const media = mediaFiles[i];
          setCurrentTask(`Compressing image assets (${i + 1} of ${totalMedia})...`);
          setProgress(15 + Math.round((i / totalMedia) * 75)); // Map to 15% - 90% range

          try {
            const imgBlob = await media.file.async('blob');
            
            // Create image element to scale on canvas
            const img = new Image();
            const imgUrl = URL.createObjectURL(imgBlob);
            img.src = imgUrl;

            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            URL.revokeObjectURL(imgUrl);

            // Scale calculations
            let width = img.width;
            let height = img.height;

            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
              } else {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
              }
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);

              const isPng = media.name.endsWith('.png');
              const mime = isPng ? 'image/png' : 'image/jpeg';
              const qual = isPng ? undefined : quality;

              const compressedBlob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, mime, qual);
              });

              if (compressedBlob) {
                zip.file(media.name, compressedBlob);
              }
            }
          } catch (imgErr) {
            console.warn(`Failed to compress image ${media.name}:`, imgErr);
            // Skip this image and continue
          }
        }
      }

      setCurrentTask('Compiling optimized PowerPoint presentation...');
      setProgress(92);

      const outBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(outBlob);
      const outputFilename = `${file.name.replace(/\.[^/.]+$/, '')}_compressed.pptx`;

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputFilename,
        originalSize: file.size,
        compressedSize: outBlob.size
      });

      // Dispatch global history event
      const uploadId = 'ppt_comp_' + Math.random().toString(36).substring(2, 11);
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: outputFilename,
          tool: 'Compress PPT',
          size: outBlob.size,
          originalSize: file.size,
          compressedSize: outBlob.size,
          downloadUrl: downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to compress PowerPoint presentation.');
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
      successResult={successResult as any} // mapping isn't perfect, but we override it below
      onReset={resetTool}
      accept=".pptx"
      multiple={false}
      onFilesSelected={handleFilesSelected}
      actionButtonLabel="Compress Presentation"
      onAction={handleCompress}
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
              <h3 className="text-xl font-bold text-white mb-2">Compression Complete!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Successfully compressed media files. The presentation is ready for download.
              </p>
            </div>

            {/* Space Saving Stats Card */}
            <div className="w-full max-w-sm grid grid-cols-3 gap-3">
              {[
                { label: 'Original', value: formatSize(successResult.originalSize) },
                { label: 'Compressed', value: formatSize(successResult.compressedSize), color: 'text-green-400 font-extrabold' },
                { label: 'Savings', value: `-${Math.round((1 - successResult.compressedSize / successResult.originalSize) * 100)}%`, color: 'text-accent-secondary font-black' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3 flex flex-col gap-1 text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{stat.label}</span>
                  <span className={`text-xs ${stat.color || 'text-white'}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={successResult.downloadUrl}
                download={successResult.name}
                className="flex-grow py-3 px-5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download Presentation
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
        {/* Left Info Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Presentation Details
          </h3>
          
          <div className="border border-white/5 bg-black/25 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-rose-500/10">
              <Presentation className="w-8 h-8" />
            </div>
            {file && (
              <div>
                <h4 className="text-white font-extrabold text-base mb-1.5">{file.name}</h4>
                <div className="flex items-center justify-center gap-3 text-slate-400 text-xs font-semibold">
                  <span>PowerPoint Slideshow</span>
                  <span>·</span>
                  <span>{formatSize(file.size)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Settings Column */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-accent-secondary" /> Presets
            </h3>

            <div className="flex flex-col gap-2.5">
              {[
                { id: 'basic', title: 'Basic Compression', desc: 'Slightly resizes large images to 1600px. Standard quality.', icon: Clock },
                { id: 'medium', title: 'Recommended (Medium)', desc: 'Optimizes images to 1200px. Highly recommended preset.', icon: Zap },
                { id: 'strong', title: 'Strong Compression', desc: 'Resizes all assets to 800px. Maximum size reduction.', icon: TrendingDown }
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setLevel(preset.id as any)}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    level === preset.id
                      ? 'bg-accent-secondary/10 border-accent-secondary/30 text-white'
                      : 'bg-white/2 border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <preset.icon className={`w-3.5 h-3.5 ${level === preset.id ? 'text-accent-secondary' : 'text-slate-500'}`} />
                    {preset.title}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-normal pl-5">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Informational Badge */}
          <div className="mt-auto p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent-secondary font-bold">
              <Zap className="w-4 h-4 text-accent-secondary" /> Offline Compression
            </div>
            <p className="text-[11px] text-slate-400">
              By compressing image assets locally in your browser, your files are never uploaded or shared with any third party, offering high privacy speed.
            </p>
          </div>
        </div>
      </div>
    </ConverterShell>
  );
}
