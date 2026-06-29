'use client';

import React, { useState, useEffect } from 'react';
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
import ConverterShell from '@/components/ConverterShell';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';
import { pdfjsLib } from '@/lib/pdfjs-setup';
import { formatSize } from '@/lib/utils';

// Set up pdf.js worker URL

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
    if (successResult?.downloadUrl) {
      URL.revokeObjectURL(successResult.downloadUrl);
    }
    setFile(null);
    setFileBuffer(null);
    setPassword('');
    setIsEncrypted(null);
    setProcessing(false);
    setProgress(0);
    setError(null);
    setSuccessResult(null);
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
      currentTask="Decrypting document structure..."
      error={error}
      successResult={successResult}
      onReset={resetTool}
      accept=".pdf"
      multiple={false}
      onFilesSelected={handleFilesSelected}
      actionButtonLabel="Unlock PDF"
      onAction={handleDecrypt}
      isActionDisabled={!isEncrypted || !password}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Document Info Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Document Details
          </h3>
          
          <div className="border border-white/5 bg-black/25 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/5">
              <Key className="w-8 h-8" />
            </div>
            {file && (
              <div>
                <h4 className="text-white font-extrabold text-base mb-1.5">{file.name}</h4>
                <div className="flex items-center justify-center gap-3 text-slate-400 text-xs font-semibold">
                  <span>PDF Document</span>
                  <span>·</span>
                  <span>{formatSize(file.size)}</span>
                </div>
              </div>
            )}

            {isEncrypted && (
              <div className="mt-2 py-1 px-3 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 font-extrabold text-[10px] uppercase tracking-wider">
                Password Protected
              </div>
            )}
          </div>
        </div>

        {/* Right Settings/Actions Sidebar */}
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
      </div>
    </ConverterShell>
  );
}
