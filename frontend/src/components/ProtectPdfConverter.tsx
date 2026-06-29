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
import ConverterShell from '@/components/ConverterShell';
import dynamic from 'next/dynamic';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
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
    if (successResult?.downloadUrl) {
      URL.revokeObjectURL(successResult.downloadUrl);
    }
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
      currentTask={currentTask || 'Encrypting PDF documents locally...'}
      error={error}
      successResult={successResult}
      onReset={resetTool}
      accept=".pdf"
      multiple={false}
      onFilesSelected={handleFilesSelected}
      actionButtonLabel="Protect PDF"
      actionButtonIcon={<Lock className="w-3.5 h-3.5" />}
      onAction={handleProtect}
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
        </div>
      </div>
    </ConverterShell>
  );
}
