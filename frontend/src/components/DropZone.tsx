'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSize } from '@/lib/utils';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

export default function DropZone({
  onFilesSelected,
  multiple = false,
  maxFiles = 10,
  accept = '.pdf',
  selectedFiles,
  onRemoveFile
}: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (filesList: FileList) => {
    setError(null);
    const newFiles: File[] = [];
    
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      
      // Extension validation
      const dotIndex = file.name.lastIndexOf('.');
      const ext = dotIndex > 0 ? file.name.substring(dotIndex).toLowerCase() : '';
      if (accept.split(',').map(a => a.trim()).indexOf(ext) === -1 && accept !== '*') {
        setError(`Only files with extensions ${accept} are accepted.`);
        return;
      }
      
      newFiles.push(file);
      
      if (!multiple) {
        break; // Only take the first file if single mode
      }
    }

    if (multiple && selectedFiles.length + newFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    onFilesSelected(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="w-full flex flex-col gap-4">
      {/* Upload Drag Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`w-full rounded-2xl border-2 border-dashed py-12 px-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-accent-primary bg-accent-primary/5 scale-[0.99] shadow-lg shadow-accent-primary/5'
            : 'border-white/10 hover:border-white/20 bg-slate-950/40 hover:bg-slate-950/60'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
          className="hidden"
        />

        <motion.div
          animate={{ y: isDragActive ? -4 : 0 }}
          className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-4 group-hover:text-white"
        >
          <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-accent-primary' : 'text-slate-400'}`} />
        </motion.div>

        <h3 className="text-white font-bold text-base mb-1">
          Drag & drop your {multiple ? 'files' : accept.replace('.', '').toUpperCase()} here
        </h3>
        <p className="text-slate-500 text-xs mb-3">
          Or click to browse from your device
        </p>
        <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 border border-white/5 font-semibold">
          MAX FILE SIZE: 50MB
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File List */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1"
          >
            {selectedFiles.map((file, i) => (
              <motion.div
                key={`${file.name}-${i}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold text-xs truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {formatSize(file.size)}
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(i);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
