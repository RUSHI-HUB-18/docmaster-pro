'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock,
  Shield,
  FileText
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import dynamic from 'next/dynamic';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';

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

export default function ProtectPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    downloadUrl: string;
    name: string;
    size: number;
  } | null>(null);

  const handleFilesSelected = (selected: File[]) => {
    if (selected.length > 0) {
      setError(null);
      setFile(selected[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const resetTool = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setSuccessResult(null);
  };

  const getPasswordStrength = () => {
    if (!password) return { label: 'None', color: 'bg-white/5', width: 'w-0', level: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (password.length < 6) {
      return { label: 'Too Short', color: 'bg-red-500', width: 'w-1/4', level: 1 };
    }

    if (score <= 1) return { label: 'Weak', color: 'bg-orange-500', width: 'w-2/4', level: 2 };
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-3/4', level: 3 };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full', level: 4 };
  };

  const strength = getPasswordStrength();

  const handleProtect = async () => {
    if (!file) return;
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setProcessing(true);
    setError(null);
    setProgress(10);
    setCurrentTask('Reading PDF document...');

    try {
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as ArrayBuffer);
          } else {
            reject(new Error('Failed to read document buffer.'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error.'));
        reader.readAsArrayBuffer(file);
      });

      setProgress(40);
      setCurrentTask('Encrypting with AES-256 standard...');

      const pdfBytes = new Uint8Array(arrayBuffer);
      
      // Perform client-side encryption using native Web Crypto
      const encryptedBytes = await encryptPDF(pdfBytes, password);

      setProgress(85);
      setCurrentTask('Generating secure document...');

      const blob = new Blob([encryptedBytes as any], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const outputFilename = `${file.name.replace(/\.[^/.]+$/, '')}_protected.pdf`;

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputFilename,
        size: blob.size,
      });

      // Dispatch event to Download Center / local history
      const uploadId = 'protect_' + Math.random().toString(36).substring(2, 11);
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: outputFilename,
          tool: 'Protect PDF',
          size: blob.size,
          downloadUrl: downloadUrl,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(processedEvent);

      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while encrypting the PDF document. Make sure the file is not already protected.');
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
              <h3 className="text-xl font-bold text-white mb-2">PDF Protected Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Your document is now secure. The file was encrypted in-browser using standard 256-bit AES protection.
              </p>
            </div>

            {/* File Info Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  Secure PDF · {formatSize(successResult.size)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={successResult.downloadUrl}
                download={successResult.name}
                className="flex-grow py-3 px-5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download File
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
          /* CONVERTING STATE SCREEN */
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-5 text-center"
          >
            <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
            <div>
              <h3 className="text-white font-bold text-base mb-1">{currentTask}</h3>
              <p className="text-slate-500 text-xs">Encrypting PDF documents locally in your browser. Your password never leaves this tab.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-rose-600"
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
          /* CONFIGURATION VIEW */
          <motion.div
            key="configure"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Preview Column */}
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

            {/* Right Settings Column */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-red-500" /> Security Options
                </h3>

                <div className="flex flex-col gap-5">
                  {/* Enter Password */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-xs font-bold text-slate-400 uppercase">Set Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose a password"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/2 border border-white/5">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-500 uppercase">Strength</span>
                        <span className={`text-[9px] font-black uppercase ${
                          strength.level === 1 ? 'text-red-500' :
                          strength.level === 2 ? 'text-orange-500' :
                          strength.level === 3 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Secure Info Badge */}
              <div className="mt-auto p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-500 font-bold">
                  <Lock className="w-4 h-4" /> 256-Bit AES Encryption
                </div>
                <p className="text-[11px] text-slate-400">
                  Your password is processed client-side using industry-standard AES cryptography. PDF viewers will prompt for this password to display the file contents.
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
                  onClick={handleProtect}
                  className="flex-grow py-2.5 rounded-xl font-bold bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-500 hover:to-rose-600/90 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/10 transition-all text-xs"
                >
                  Protect PDF <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
