import React from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Clock
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import { API_URL } from '@/lib/config';

export interface ConverterShellProps {
  files: File[] | any[];
  processing: boolean;
  progress: number;
  currentTask: string;
  error: string | null;
  successResult: {
    downloadUrl: string;
    name: string;
    size?: number;
  } | null;
  successComponent?: React.ReactNode;
  onReset: () => void;
  
  // Upload Config
  accept: string;
  multiple: boolean;
  onFilesSelected: (files: File[]) => void;
  
  // Action Button Config
  actionButtonLabel: string;
  actionButtonIcon?: React.ReactNode;
  onAction: () => void;
  isActionDisabled?: boolean;
  
  // Workspace UI (file list, settings, previews)
  children: React.ReactNode;
}

export default function ConverterShell({
  files,
  processing,
  progress,
  currentTask,
  error,
  successResult,
  onReset,
  accept,
  multiple,
  onFilesSelected,
  actionButtonLabel,
  actionButtonIcon = <ChevronRight className="w-4 h-4" />,
  onAction,
  isActionDisabled = false,
  successComponent,
  children
}: ConverterShellProps) {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl glass-panel p-6 md:p-8 min-h-[400px] flex flex-col justify-center">
      <div className="relative w-full">
        {successResult ? (
          successComponent ? (
            successComponent
          ) : (
          /* SUCCESS SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-8 gap-5 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <FileCheck className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Process Completed!</h3>
              <p className="text-slate-400 text-xs">
                Your file is ready. Click download or process another batch.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm mt-2">
              <a
                href={
                  successResult.downloadUrl.startsWith('blob:') || 
                  successResult.downloadUrl.startsWith('data:') || 
                  successResult.downloadUrl.startsWith('http')
                    ? successResult.downloadUrl
                    : `${API_URL}${successResult.downloadUrl}`
                }
                download={successResult.name}
                className="flex-grow py-3 px-5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download {successResult.name.split('.').pop()?.toUpperCase() || 'FILE'}
              </a>
              <button
                onClick={onReset}
                className="py-3 px-5 rounded-xl font-bold border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </motion.div>
          )
        ) : processing ? (
          /* PROCESSING SCREEN */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 gap-5 text-center"
          >
            <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
            <div>
              <h3 className="text-white font-bold text-base mb-1">{currentTask || 'Processing...'}</h3>
              <p className="text-slate-500 text-xs">Please wait while we process your request. Do not close this tab.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        ) : files.length === 0 ? (
          /* UPLOAD ZONE */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <DropZone
              onFilesSelected={onFilesSelected}
              multiple={multiple}
              selectedFiles={[]}
              onRemoveFile={() => {}}
              accept={accept}
            />
          </motion.div>
        ) : (
          /* WORKSPACE */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Custom UI provided by the specific tool */}
            {children}

            {/* Common Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4 mt-4">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] sm:text-xs">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Processes locally & securely · 100% Free</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onReset}
                  className="flex-grow sm:flex-none py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-xs text-white font-bold transition-all shrink-0"
                >
                  Cancel
                </button>
                <button
                  onClick={onAction}
                  disabled={isActionDisabled}
                  className="flex-grow sm:flex-none py-2.5 px-6 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-accent-primary/10 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionButtonLabel} {actionButtonIcon}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
