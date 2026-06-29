'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  FileCheck,
  Download,
  AlertCircle,
  RefreshCw,
  FileText,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import DropZone from '@/components/DropZone';
import ConverterShell from '@/components/ConverterShell';
import dynamic from 'next/dynamic';
import { Document, Packer, Paragraph, TextRun } from 'docx';

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

export default function PdfToWordConverter() {
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

  const handleConvertToWord = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setProgress(5);
    setCurrentTask('Reading PDF document...');

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

      setProgress(20);
      setCurrentTask('Parsing PDF structure...');

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      if (totalPages === 0) {
        throw new Error('This PDF document contains no pages.');
      }

      const paragraphsList: string[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setCurrentTask(`Extracting text from page ${pageNum} of ${totalPages}...`);
        setProgress(20 + Math.round((pageNum / totalPages) * 50)); // Map to 20% - 70% range

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Group text items by their y-coordinate (logical line detection)
        // items have transform: [scaleX, skewX, skewY, scaleY, translateX, translateY]
        const items = textContent.items as any[];
        
        if (items.length === 0) continue;

        // Grouping threshold (in PDF points, ~1/72 inch)
        const threshold = 4;
        const lines: { y: number; items: any[] }[] = [];

        items.forEach((item) => {
          if (!item.str || !item.str.trim()) return;
          const y = item.transform[5];
          const x = item.transform[4];

          // Check if this item belongs to an existing line
          const matchedLine = lines.find((l) => Math.abs(l.y - y) <= threshold);
          if (matchedLine) {
            matchedLine.items.push({ x, text: item.str });
          } else {
            lines.push({ y, items: [{ x, text: item.str }] });
          }
        });

        // Sort lines vertically (descending, since PDF y-axis starts from the bottom)
        lines.sort((a, b) => b.y - a.y);

        // Sort items inside each line horizontally (left-to-right)
        lines.forEach((line) => {
          line.items.sort((a, b) => a.x - b.x);
          const lineText = line.items.map((i) => i.text).join(' ');
          paragraphsList.push(lineText);
        });

        // Add a line gap after each page
        paragraphsList.push('');
      }

      setCurrentTask('Compiling Word document...');
      setProgress(85);

      // Create a docx document structure
      const docElements: Paragraph[] = [];
      let currentParagraphText = '';

      paragraphsList.forEach((lineText) => {
        if (!lineText) {
          // Empty line indicates paragraph boundary
          if (currentParagraphText.trim()) {
            docElements.push(
              new Paragraph({
                children: [new TextRun({ text: currentParagraphText.trim(), size: 24 })],
                spacing: { after: 120 } // Space after paragraph (120 dxa = 6pt)
              })
            );
            currentParagraphText = '';
          }
        } else {
          // Accumulate line text into paragraph
          currentParagraphText += (currentParagraphText ? ' ' : '') + lineText;
        }
      });

      // Handle the last remaining paragraph if any
      if (currentParagraphText.trim()) {
        docElements.push(
          new Paragraph({
            children: [new TextRun({ text: currentParagraphText.trim(), size: 24 })]
          })
        );
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docElements.length > 0 ? docElements : [new Paragraph({ children: [new TextRun('Empty Document')] })],
          },
        ],
      });

      const docxBlob = await Packer.toBlob(doc);
      const downloadUrl = URL.createObjectURL(docxBlob);
      const outputFilename = `${file.name.replace(/\.[^/.]+$/, '')}.docx`;

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputFilename,
        size: docxBlob.size,
        pageCount: totalPages
      });

      // Dispatch global history event
      const uploadId = 'docx_conv_' + Math.random().toString(36).substring(2, 11);
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: outputFilename,
          tool: 'PDF to Word',
          size: docxBlob.size,
          downloadUrl: downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to convert PDF document.');
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
      currentTask={currentTask || 'Converting PDF to Word...'}
      error={error}
      successResult={successResult as any}
      onReset={resetTool}
      accept=".pdf"
      multiple={false}
      onFilesSelected={handleFilesSelected}
      actionButtonLabel="Convert to Word"
      onAction={handleConvertToWord}
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
              <h3 className="text-xl font-bold text-white mb-2">PDF Converted Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Successfully extracted text layout and compiled it into a Word document. Download it below.
              </p>
            </div>

            {/* File Info Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  Word Document (.docx) · {formatSize(successResult.size)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={successResult.downloadUrl}
                download={successResult.name}
                className="flex-grow py-3 px-5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download Word File
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
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Conversion Settings
            </h3>

            {file && (
              <div className="flex flex-col gap-3 rounded-2xl bg-white/2 border border-white/5 p-4 text-xs text-slate-400">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="font-bold">File Name</span>
                  <span className="text-white truncate max-w-[150px] font-semibold">{file.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="font-bold">Original Size</span>
                  <span className="text-white font-semibold">{formatSize(file.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Mode</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400" /> Text Layout Extraction
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Informational Badge */}
          <div className="mt-auto p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent-primary font-bold">
              <Clock className="w-4 h-4" /> 100% Client-Side Processing
            </div>
            <p className="text-[11px] text-slate-400">
              Your PDF text content is parsed and compiled locally. Your files are never uploaded or stored, ensuring absolute privacy.
            </p>
          </div>
        </div>
      </div>
    </ConverterShell>
  );
}
