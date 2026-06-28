'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  Clock,
  Zap,
  ChevronRight,
  Unlock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';
import * as pdfjsLib from 'pdfjs-dist';

// Set up pdf.js worker URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function UnlockPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    downloadUrl: string;
    name: string;
    size: number;
  } | null>(null);

  const handleFilesSelected = async (selected: File[]) => {
    if (selected.length === 0) return;
    const selectedFile = selected[0];

    setError(null);
    setFile(selectedFile);
    setProcessing(true);
    setProgress(20);

    try {
      const buffer = await selectedFile.arrayBuffer();
      setFileBuffer(buffer);

      // Verify if document requires a password using PDF.js
      try {
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        await loadingTask.promise;
        
        // If it loaded without an error, it is already unlocked!
        setIsEncrypted(false);
        setError('This PDF is already unlocked and does not require a password.');
        setProcessing(false);
      } catch (pdfErr: any) {
        if (pdfErr.name === 'PasswordException') {
          // Document is encrypted!
          setIsEncrypted(true);
          setProcessing(false);
        } else {
          throw pdfErr;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to parse PDF document. Make sure the file is not corrupted.');
      setFile(null);
      setProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file || !fileBuffer || !password) return;

    setProcessing(true);
    setError(null);
    setProgress(40);

    try {
      setProgress(70);
      const decryptedBytes = await decryptPDF(new Uint8Array(fileBuffer), password);
      
      const blob = new Blob([decryptedBytes as any], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const outputFilename = `${file.name.replace(/\.[^/.]+$/, '')}_unlocked.pdf`;

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputFilename,
        size: blob.size
      });

      // Dispatch global history event
      const uploadId = 'pdf_unlock_' + Math.random().toString(36).substring(2, 11);
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: outputFilename,
          tool: 'Unlock PDF',
          size: blob.size,
          downloadUrl: downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError('Incorrect password. Please verify and try again.');
      setProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileBuffer(null);
    setPassword('');
    setIsEncrypted(null);
    setError(null);
  };

  const resetTool = () => {
    setFile(null);
    setFileBuffer(null);
    setPassword('');
    setIsEncrypted(null);
    setProcessing(false);
    setProgress(0);
    setError(null);
    setSuccessResult(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {successResult ? (
          /* SUCCESS SCREEN */
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
              <h3 className="text-xl font-bold text-white mb-2">PDF Unlocked Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Password security has been removed. You can now open, print, and edit this document freely.
              </p>
            </div>

            {/* File Info Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                <Unlock className="w-5 h-5 text-accent-primary" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  Unlocked PDF · {formatSize(successResult.size)}
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
        ) : processing ? (
          /* UNLOCKING STATE SCREEN */
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-5 text-center"
          >
            <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
            <div>
              <h3 className="text-white font-bold text-base mb-1">Decrypting document structure...</h3>
              <p className="text-slate-500 text-xs">Running local cryptographic Web Crypto decoding. Do not close this tab.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        ) : !file ? (
          /* UPLOAD ZONE */
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <DropZone
              onFilesSelected={handleFilesSelected}
              multiple={false}
              selectedFiles={[]}
              onRemoveFile={() => {}}
            />
          </motion.div>
        ) : (
          /* CONFIGURATION / PASSWORD PROMPT VIEW */
          <motion.div
            key="configure"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Document Info Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Document Details
              </h3>
              
              <div className="border border-white/5 bg-black/25 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/5">
                  <Key className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-white font-extrabold text-base mb-1.5">{file.name}</h4>
                  <div className="flex items-center justify-center gap-3 text-slate-400 text-xs font-semibold">
                    <span>PDF Document</span>
                    <span>·</span>
                    <span>{formatSize(file.size)}</span>
                  </div>
                </div>

                {isEncrypted && (
                  <div className="mt-2 py-1 px-3 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 font-extrabold text-[10px] uppercase tracking-wider">
                    Password Protected
                  </div>
                )}
              </div>
            </div>

            {/* Right Settings/Actions Sidebar */}
            <div className="flex flex-col gap-6 justify-between">
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Unlock Security
                  </h3>

                  {isEncrypted ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Enter PDF Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-accent-primary rounded-xl py-2.5 pl-4 pr-10 text-white text-xs placeholder:text-slate-500 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-all"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/2 border border-white/5 text-slate-400 text-xs leading-relaxed">
                      This document does not have password restrictions. Decryption is not required.
                    </div>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <Zap className="w-4 h-4 text-green-400" /> Private & Client-Side
                </div>
                <p className="text-[11px] text-slate-400">
                  Decryption occurs entirely within your browser. Your password and document are processed locally and never sent to any server.
                </p>
              </div>

              {/* Errors Display */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Control Action Buttons */}
              <div className="border-t border-white/5 pt-4 flex items-center gap-3">
                <button
                  onClick={removeFile}
                  className="py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-xs text-white font-bold transition-all shrink-0"
                >
                  Change File
                </button>
                <button
                  onClick={handleDecrypt}
                  disabled={!isEncrypted || !password}
                  className="flex-grow py-2.5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-accent-primary/10 transition-all text-xs disabled:opacity-45 disabled:hover:bg-accent-primary"
                >
                  Unlock PDF <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
