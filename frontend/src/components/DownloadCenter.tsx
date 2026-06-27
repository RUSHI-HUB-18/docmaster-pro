'use client';

import React, { useEffect, useState } from 'react';
import { Download, Trash2, Clock, FileText, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '@/lib/config';

export interface ProcessedFile {
  id: string; // uploadId
  name: string; // filename
  tool: string; // 'Merge', 'Split', 'Compress', 'Rotate'
  size: number;
  originalSize?: number;
  compressedSize?: number;
  downloadUrl: string;
  timestamp: number;
}

export default function DownloadCenter() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load files on mount
  useEffect(() => {
    const saved = localStorage.getItem('pdfmaster_processed_files');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ProcessedFile[];
        // Filter out files older than 10 minutes (matches server retention policy)
        const active = parsed.filter(f => Date.now() - f.timestamp < 10 * 60 * 1000);
        setFiles(active);
        if (active.length !== parsed.length) {
          localStorage.setItem('pdfmaster_processed_files', JSON.stringify(active));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync to localStorage
  const saveFiles = (updatedList: ProcessedFile[]) => {
    setFiles(updatedList);
    localStorage.setItem('pdfmaster_processed_files', JSON.stringify(updatedList));
  };

  // Add a new file to the list (called globally or via event dispatch)
  useEffect(() => {
    const handleNewFile = (e: Event) => {
      const customEvent = e as CustomEvent<ProcessedFile>;
      if (customEvent.detail) {
        const saved = localStorage.getItem('pdfmaster_processed_files');
        let current: ProcessedFile[] = [];
        if (saved) {
          try { current = JSON.parse(saved); } catch (e) {}
        }
        // Exclude expired (10-minute retention policy)
        current = current.filter(f => Date.now() - f.timestamp < 10 * 60 * 1000);
        
        // Add new file at the beginning
        const updated = [customEvent.detail, ...current];
        saveFiles(updated);
        setIsOpen(true); // Open the center to highlight success!
      }
    };

    window.addEventListener('pdfmaster_add_processed_file', handleNewFile);
    return () => window.removeEventListener('pdfmaster_add_processed_file', handleNewFile);
  }, []);

  // Delete file
  const deleteFile = async (file: ProcessedFile) => {
    // Call backend delete route
    if (!file.downloadUrl.startsWith('blob:') && !file.downloadUrl.startsWith('data:') && !file.downloadUrl.startsWith('http')) {
      try {
        const url = `${API_URL}${file.downloadUrl.replace('/download/', '/delete/')}`;
        await fetch(url, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to request backend deletion:', err);
      }
    }

    // Remove from UI list
    const updated = files.filter(f => !(f.id === file.id && f.name === file.name));
    saveFiles(updated);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeLeft = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    const timeLeftMs = 10 * 60 * 1000 - elapsed;
    if (timeLeftMs <= 0) return 'Expired';
    const mins = Math.ceil(timeLeftMs / 1000 / 60);
    return `${mins}m left`;
  };

  if (files.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Floating Toggle Badge */}
      {!isOpen && (
        <motion.button
          layoutId="download-center"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4.5 py-3 rounded-2xl bg-gradient-to-r from-accent-primary to-purple-600 text-white font-bold shadow-xl border border-accent-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Download Center</span>
          <span className="w-5.5 h-5.5 rounded-full bg-white text-accent-primary flex items-center justify-center text-xs font-black">
            {files.length}
          </span>
        </motion.button>
      )}

      {/* Main Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId="download-center"
            className="w-[360px] sm:w-[400px] rounded-3xl glass-panel p-5 border border-white/10 shadow-2xl flex flex-col gap-4 max-h-[500px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent-primary" />
                <span className="font-extrabold text-white text-sm">Download Center</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-white font-bold flex items-center gap-0.5 hover:bg-white/5 px-2.5 py-1 rounded-lg border border-transparent hover:border-white/5"
              >
                Hide <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3 overflow-y-auto flex-grow pr-1">
              {files.map((file) => (
                <div
                  key={`${file.id}-${file.name}`}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 flex flex-col gap-2 relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white text-xs font-bold truncate pr-6">
                          {file.name}
                        </h4>
                        <span className="text-[10px] text-accent-primary font-bold">
                          Processed via {file.tool}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteFile(file)}
                      className="w-7 h-7 rounded-lg hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-slate-500 hover:border-red-500/20 border border-transparent transition-all"
                      title="Delete now"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Size Comparisons */}
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 bg-black/20 p-2 rounded-lg">
                    {file.tool === 'Compress' && file.originalSize && file.compressedSize ? (
                      <>
                        <span className="line-through text-slate-500">{formatSize(file.originalSize)}</span>
                        <span className="text-green-400 font-extrabold">
                          {formatSize(file.compressedSize)} (-{Math.round((1 - file.compressedSize / file.originalSize) * 100)}%)
                        </span>
                      </>
                    ) : (
                      <span>Size: {formatSize(file.size)}</span>
                    )}

                    <span className="flex items-center gap-1 text-[9px] text-slate-500 font-normal">
                      <Clock className="w-2.5 h-2.5" /> {formatTimeLeft(file.timestamp)}
                    </span>
                  </div>

                  {/* Download Action */}
                  <a
                    href={file.downloadUrl.startsWith('blob:') || file.downloadUrl.startsWith('data:') || file.downloadUrl.startsWith('http') ? file.downloadUrl : `${API_URL}${file.downloadUrl}`}
                    className="w-full py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white text-[11px] font-bold text-center flex items-center justify-center gap-1.5 mt-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </a>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="text-[10px] text-slate-500 text-center font-medium bg-white/2">
              Files are processed in isolated sessions and automatically deleted after 10 minutes.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
