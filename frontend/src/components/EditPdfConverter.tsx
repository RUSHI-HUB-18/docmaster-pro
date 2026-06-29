'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck,
  Download,
  RefreshCw,
  FileText,
  Clock,
  MousePointerClick,
  Save,
  Pencil,
  Undo2,
  Type
} from 'lucide-react';
import ConverterShell from '@/components/ConverterShell';
import { formatSize } from '@/lib/utils';

// Lazy imports for client-side only
let pdfjsLib: any = null;
let pdfLib: any = null;

interface TextItem {
  id: string;
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  pageIndex: number;
  transform: number[];
}

interface Edit {
  itemId: string;
  original: string;
  edited: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  transform: number[];
}

export default function EditPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCanvases, setPageCanvases] = useState<string[]>([]); // Data URLs for each page
  const [pageTextItems, setPageTextItems] = useState<TextItem[][]>([]);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }[]>([]);
  const [edits, setEdits] = useState<Map<string, Edit>>(new Map());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    downloadUrl: string;
    name: string;
    size: number;
  } | null>(null);

  const pageContainerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Load libraries
  useEffect(() => {
    const loadLibs = async () => {
      const pdfjs = await import('pdfjs-dist');
      pdfjsLib = pdfjs;
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      pdfLib = await import('pdf-lib');
    };
    loadLibs();
  }, []);

  const handleFilesSelected = async (selected: File[]) => {
    if (selected.length === 0) return;
    const selectedFile = selected[0];
    setFile(selectedFile);
    setError(null);
    setProcessing(true);
    setCurrentTask('Reading PDF document...');
    setProgress(10);

    try {
      const buffer = await selectedFile.arrayBuffer();
      setArrayBuffer(buffer);

      if (!pdfjsLib) {
        const pdfjs = await import('pdfjs-dist');
        pdfjsLib = pdfjs;
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }
      if (!pdfLib) {
        pdfLib = await import('pdf-lib');
      }

      setProgress(30);
      setCurrentTask('Rendering pages...');

      const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
      const pdf = await loadingTask.promise;
      const total = pdf.numPages;
      setPageCount(total);

      const canvases: string[] = [];
      const allTextItems: TextItem[][] = [];
      const dims: { width: number; height: number }[] = [];
      const RENDER_SCALE = 1.5;

      for (let i = 1; i <= total; i++) {
        setCurrentTask(`Scanning page ${i} of ${total}...`);
        setProgress(30 + Math.round((i / total) * 60));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        // Render page to canvas
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        canvases.push(canvas.toDataURL('image/png'));
        dims.push({ width: viewport.width, height: viewport.height });

        // Extract text
        const textContent = await page.getTextContent();
        const items: TextItem[] = [];

        (textContent.items as any[]).forEach((item, idx) => {
          if (!item.str || !item.str.trim()) return;

          const tx = item.transform;
          // PDF coordinates: origin bottom-left. Canvas: origin top-left.
          const fontSize = Math.abs(tx[3]) * RENDER_SCALE || 12 * RENDER_SCALE;
          const x = tx[4] * RENDER_SCALE;
          const y = viewport.height - (tx[5] * RENDER_SCALE) - fontSize;
          const width = (item.width || item.str.length * fontSize * 0.6) * RENDER_SCALE;

          items.push({
            id: `p${i - 1}_t${idx}`,
            str: item.str,
            x,
            y,
            width: Math.max(width, 20),
            height: fontSize + 4,
            fontSize,
            fontName: item.fontName || 'Helvetica',
            pageIndex: i - 1,
            transform: tx,
          });
        });

        allTextItems.push(items);
      }

      setPageCanvases(canvases);
      setPageTextItems(allTextItems);
      setPageDimensions(dims);
      setCurrentPage(0);
      setProcessing(false);
      setProgress(100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse PDF. The file may be corrupted or encrypted.');
      setProcessing(false);
      setFile(null);
    }
  };

  const handleTextClick = useCallback((item: TextItem) => {
    // Check if this item already has an edit
    const existingEdit = edits.get(item.id);
    setEditingItemId(item.id);
    setEditText(existingEdit ? existingEdit.edited : item.str);
    setTimeout(() => editInputRef.current?.focus(), 50);
  }, [edits]);

  const handleEditSave = useCallback(() => {
    if (!editingItemId) return;

    const pageItems = pageTextItems[currentPage] || [];
    const item = pageItems.find(t => t.id === editingItemId);
    if (!item) {
      setEditingItemId(null);
      return;
    }

    if (editText !== item.str) {
      const newEdits = new Map(edits);
      newEdits.set(editingItemId, {
        itemId: editingItemId,
        original: item.str,
        edited: editText,
        pageIndex: item.pageIndex,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        fontSize: item.fontSize,
        fontName: item.fontName,
        transform: item.transform,
      });
      setEdits(newEdits);
    } else {
      // If text is reverted to original, remove the edit
      const newEdits = new Map(edits);
      newEdits.delete(editingItemId);
      setEdits(newEdits);
    }

    setEditingItemId(null);
    setEditText('');
  }, [editingItemId, editText, edits, pageTextItems, currentPage]);

  const handleEditCancel = useCallback(() => {
    setEditingItemId(null);
    setEditText('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  }, [handleEditSave, handleEditCancel]);

  const undoAllEdits = useCallback(() => {
    setEdits(new Map());
    setEditingItemId(null);
  }, []);

  const handleSavePdf = async () => {
    if (!arrayBuffer || edits.size === 0) return;

    setProcessing(true);
    setError(null);
    setProgress(10);
    setCurrentTask('Loading PDF for editing...');

    try {
      const pdfDoc = await pdfLib.PDFDocument.load(arrayBuffer.slice(0), { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(pdfLib.StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(pdfLib.StandardFonts.HelveticaBold);

      const RENDER_SCALE = 1.5;
      let editCount = 0;
      const totalEdits = edits.size;

      for (const [, edit] of edits) {
        editCount++;
        setCurrentTask(`Applying edit ${editCount} of ${totalEdits}...`);
        setProgress(10 + Math.round((editCount / totalEdits) * 70));

        const page = pages[edit.pageIndex];
        if (!page) continue;

        const pageHeight = page.getHeight();

        // Convert from canvas coordinates back to PDF coordinates
        const pdfX = edit.transform[4];
        const pdfY = edit.transform[5];
        const pdfFontSize = Math.abs(edit.transform[3]) || 12;

        // Determine if bold based on font name
        const isBold = edit.fontName.toLowerCase().includes('bold');
        const activeFont = isBold ? fontBold : font;

        // Measure text widths
        const originalWidth = activeFont.widthOfTextAtSize(edit.original, pdfFontSize);
        const coverWidth = Math.max(originalWidth + 4, edit.original.length * pdfFontSize * 0.7);

        // Draw white rectangle to cover original text
        page.drawRectangle({
          x: pdfX - 1,
          y: pdfY - 2,
          width: coverWidth,
          height: pdfFontSize + 4,
          color: pdfLib.rgb(1, 1, 1), // white
        });

        // Draw new text at the same position
        page.drawText(edit.edited, {
          x: pdfX,
          y: pdfY,
          size: pdfFontSize,
          font: activeFont,
          color: pdfLib.rgb(0, 0, 0), // black text
        });
      }

      setProgress(90);
      setCurrentTask('Compiling edited PDF...');

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const outputName = `${(file?.name || 'document').replace(/\.[^/.]+$/, '')}_edited.pdf`;

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputName,
        size: blob.size,
      });

      // Dispatch global history event
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: 'edit_' + Math.random().toString(36).substring(2, 11),
          name: outputName,
          tool: 'Edit PDF',
          size: blob.size,
          downloadUrl,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(processedEvent);
      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save the edited PDF.');
      setProcessing(false);
    }
  };

  const resetTool = () => {
    if (successResult?.downloadUrl) {
      URL.revokeObjectURL(successResult.downloadUrl);
    }
    setFile(null);
    setArrayBuffer(null);
    setPageCount(0);
    setCurrentPage(0);
    setPageCanvases([]);
    setPageTextItems([]);
    setPageDimensions([]);
    setEdits(new Map());
    setEditingItemId(null);
    setEditText('');
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
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

  const currentItems = pageTextItems[currentPage] || [];
  const currentDims = pageDimensions[currentPage] || { width: 800, height: 1100 };

  return (
    <ConverterShell
      files={file ? [file] : []}
      processing={processing}
      progress={progress}
      currentTask={currentTask || 'Processing PDF...'}
      error={error}
      successResult={successResult as any}
      onReset={resetTool}
      accept=".pdf"
      multiple={false}
      onFilesSelected={handleFilesSelected}
      actionButtonLabel={`Save PDF (${edits.size} edit${edits.size !== 1 ? 's' : ''})`}
      actionButtonIcon={<Save className="w-4 h-4" />}
      onAction={handleSavePdf}
      isActionDisabled={edits.size === 0}
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
              <h3 className="text-xl font-bold text-white mb-2">PDF Edited Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Applied {edits.size} text edit{edits.size !== 1 ? 's' : ''} to your document. Download the modified PDF below.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  Edited PDF · {formatSize(successResult.size)}
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
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive PDF Page Viewer */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-emerald-400" /> Click Text to Edit
            </h3>
            {pageCount > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditingItemId(null); setCurrentPage(p => Math.max(0, p - 1)); }}
                  disabled={currentPage === 0}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  ← Prev
                </button>
                <span className="text-xs text-slate-400 font-bold tabular-nums">
                  {currentPage + 1} / {pageCount}
                </span>
                <button
                  onClick={() => { setEditingItemId(null); setCurrentPage(p => Math.min(pageCount - 1, p + 1)); }}
                  disabled={currentPage === pageCount - 1}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Page Canvas + Text Overlay */}
          <div
            ref={pageContainerRef}
            className="relative border border-white/10 rounded-2xl overflow-hidden bg-gray-200 shadow-xl"
            style={{ maxHeight: '650px', overflowY: 'auto' }}
          >
            {pageCanvases[currentPage] && (
              <div className="relative" style={{ width: currentDims.width, maxWidth: '100%' }}>
                {/* Rendered page image */}
                <img
                  src={pageCanvases[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-auto select-none pointer-events-none"
                  draggable={false}
                />

                {/* Clickable text overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    width: currentDims.width,
                    height: currentDims.height,
                  }}
                >
                  {currentItems.map((item) => {
                    const edit = edits.get(item.id);
                    const isEditing = editingItemId === item.id;
                    const hasEdit = !!edit;
                    const displayText = hasEdit ? edit.edited : item.str;

                    return (
                      <div
                        key={item.id}
                        className={`absolute cursor-pointer transition-all duration-150 ${
                          isEditing
                            ? 'z-30'
                            : hasEdit
                              ? 'bg-yellow-300/25 border border-yellow-400/40 rounded z-20'
                              : 'hover:bg-blue-400/15 hover:outline hover:outline-1 hover:outline-blue-400/30 rounded z-10'
                        }`}
                        style={{
                          left: `${(item.x / currentDims.width) * 100}%`,
                          top: `${(item.y / currentDims.height) * 100}%`,
                          width: `${(item.width / currentDims.width) * 100}%`,
                          height: `${(item.height / currentDims.height) * 100}%`,
                          minWidth: '8px',
                          minHeight: '8px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isEditing) handleTextClick(item);
                        }}
                        title={isEditing ? '' : `Click to edit: "${displayText}"`}
                      >
                        {isEditing && (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={handleEditSave}
                            onKeyDown={handleKeyDown}
                            className="absolute inset-0 w-full h-full bg-white border-2 border-blue-500 rounded px-1 text-black outline-none shadow-lg"
                            style={{
                              fontSize: `${(item.fontSize / currentDims.height) * 100}vh`,
                              lineHeight: 1.2,
                              fontFamily: 'Helvetica, Arial, sans-serif',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Edit Panel */}
        <div className="flex flex-col gap-5">
          {/* Instructions */}
          <div className="rounded-2xl bg-white/2 border border-white/5 p-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Pencil className="w-4 h-4 text-emerald-400" /> How to Edit
            </h3>
            <ol className="text-[11px] text-slate-400 space-y-2 list-decimal list-inside leading-relaxed">
              <li><span className="text-white font-semibold">Click</span> on any text block in the PDF</li>
              <li><span className="text-white font-semibold">Type</span> your replacement text</li>
              <li>Press <span className="text-white font-semibold">Enter</span> to confirm or <span className="text-white font-semibold">Esc</span> to cancel</li>
              <li>Click <span className="text-white font-semibold">Save PDF</span> when done</li>
            </ol>
          </div>

          {/* Edit Summary */}
          <div className="rounded-2xl bg-white/2 border border-white/5 p-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-yellow-400" /> Pending Edits
            </h3>
            {edits.size === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No edits yet. Click on text in the document to start editing.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
                {Array.from(edits.values()).map((edit) => (
                  <div key={edit.itemId} className="rounded-xl bg-white/3 border border-white/5 p-3 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-500 mb-1">
                      <span className="font-bold">Page {edit.pageIndex + 1}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-red-400 line-through truncate">{edit.original}</span>
                      <span className="text-emerald-400 font-semibold truncate">{edit.edited}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {edits.size > 0 && (
              <button
                onClick={undoAllEdits}
                className="mt-3 w-full py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 text-xs text-slate-300 font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo All Edits
              </button>
            )}
          </div>

          {/* File Info */}
          {file && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white/2 border border-white/5 p-4 text-xs text-slate-400">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold">File Name</span>
                <span className="text-white truncate max-w-[140px] font-semibold">{file.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold">Pages</span>
                <span className="text-white font-semibold">{pageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">File Size</span>
                <span className="text-white font-semibold">{formatSize(file.size)}</span>
              </div>
            </div>
          )}

          {/* Privacy Badge */}
          <div className="mt-auto p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent-primary font-bold">
              <Clock className="w-4 h-4" /> 100% Client-Side
            </div>
            <p className="text-[11px] text-slate-400">
              All text editing happens locally in your browser. Your PDF is never uploaded to any server, ensuring complete privacy.
            </p>
          </div>
        </div>
      </div>
    </ConverterShell>
  );
}
