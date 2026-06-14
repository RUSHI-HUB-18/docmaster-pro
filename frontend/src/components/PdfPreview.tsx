'use client';

import React, { useEffect, useState, useRef } from 'react';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Trash2, Eye, SquareCheck, CheckSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Configure pdfjs worker dynamically from a public CDN
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfPageData {
  index: number;
  rotation: number; // 0, 90, 180, 270
  selected: boolean;
}

interface PdfPreviewProps {
  file: File;
  onPageRotationsChange?: (rotations: { pageIndex: number; degrees: number }[]) => void;
  onSelectedPagesChange?: (selectedIndices: number[]) => void;
  onPagesReorder?: (indices: number[]) => void;
  allowRotation?: boolean;
  allowSelection?: boolean;
  allowDeletion?: boolean;
  allowReorder?: boolean;
}

export default function PdfPreview({
  file,
  onPageRotationsChange,
  onSelectedPagesChange,
  onPagesReorder,
  allowRotation = true,
  allowSelection = false,
  allowDeletion = false,
  allowReorder = false
}: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pages, setPages] = useState<PdfPageData[]>([]);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(1); // Zoom level for thumbnails
  const [zoomModalIndex, setZoomModalIndex] = useState<number | null>(null);
  const [modalCanvasUrl, setModalCanvasUrl] = useState<string | null>(null);

  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

  // 1. Load PDF Document
  useEffect(() => {
    setLoading(true);
    setPages([]);
    setPdfDoc(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) return;

      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        
        const initialPages = Array.from({ length: pdf.numPages }, (_, i) => ({
          index: i,
          rotation: 0,
          selected: true
        }));
        setPages(initialPages);
      } catch (err) {
        console.error('Error loading PDF via pdfjs:', err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [file]);

  // 2. Render Page Thumbnails to Canvases
  useEffect(() => {
    if (!pdfDoc || pages.length === 0) return;

    pages.forEach(async (page) => {
      const canvas = canvasRefs.current[page.index];
      if (!canvas) return;

      try {
        const pdfPage = await pdfDoc.getPage(page.index + 1);
        const context = canvas.getContext('2d');
        if (!context) return;

        // Render at a standard baseline scale, and resize canvas
        const viewport = pdfPage.getViewport({ scale: 0.4 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        await pdfPage.render(renderContext).promise;
      } catch (err) {
        console.error(`Error rendering page ${page.index + 1}:`, err);
      }
    });
  }, [pdfDoc, pages]);

  // 3. Fire callbacks when page states change
  useEffect(() => {
    if (onPageRotationsChange) {
      const rotations = pages.map(p => ({
        pageIndex: p.index,
        degrees: p.rotation
      }));
      onPageRotationsChange(rotations);
    }
    if (onSelectedPagesChange) {
      const selected = pages.filter(p => p.selected).map(p => p.index);
      onSelectedPagesChange(selected);
    }
  }, [pages, onPageRotationsChange, onSelectedPagesChange]);

  // Rotate individual page
  const rotatePage = (index: number, direction: 'cw' | 'ccw') => {
    setPages(prev => prev.map(p => {
      if (p.index === index) {
        const diff = direction === 'cw' ? 90 : -90;
        const newRotation = (p.rotation + diff + 360) % 360;
        return { ...p, rotation: newRotation };
      }
      return p;
    }));
  };

  // Rotate all pages at once
  const rotateAll = (deg: number) => {
    setPages(prev => prev.map(p => ({
      ...p,
      rotation: (p.rotation + deg + 360) % 360
    })));
  };

  // Toggle selection
  const toggleSelect = (index: number) => {
    setPages(prev => prev.map(p => {
      if (p.index === index) {
        return { ...p, selected: !p.selected };
      }
      return p;
    }));
  };

  // Delete/Exclude a page from processing
  const deletePage = (index: number) => {
    setPages(prev => prev.filter(p => p.index !== index));
    if (onPagesReorder) {
      const remainingIndices = pages.filter(p => p.index !== index).map(p => p.index);
      onPagesReorder(remainingIndices);
    }
  };

  // Open Modal Zoom View
  const openZoomModal = async (index: number) => {
    if (!pdfDoc) return;
    setZoomModalIndex(index);
    setModalCanvasUrl(null);

    try {
      const pdfPage = await pdfDoc.getPage(index + 1);
      const tempCanvas = document.createElement('canvas');
      const context = tempCanvas.getContext('2d');
      if (!context) return;

      const viewport = pdfPage.getViewport({ scale: 1.5 }); // High-quality resolution zoom
      tempCanvas.height = viewport.height;
      tempCanvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await pdfPage.render(renderContext).promise;
      setModalCanvasUrl(tempCanvas.toDataURL());
    } catch (err) {
      console.error('Error generating zoom preview:', err);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 border border-white/5 bg-slate-950/20 rounded-2xl flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
        <span className="text-slate-400 text-xs">Generating previews...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Zoom / Global Actions Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold pl-2">
          <span>Total: {numPages} Pages</span>
          {pages.length !== numPages && (
            <span className="text-accent-secondary">({pages.length} selected)</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {allowRotation && (
            <>
              <button
                type="button"
                onClick={() => rotateAll(90)}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-xs text-white font-semibold flex items-center gap-1.5 hover:bg-white/10 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" /> Rotate All
              </button>
            </>
          )}

          <div className="h-6 w-[1px] bg-white/10 mx-1" />

          {/* Grid Size Scaling */}
          <button
            type="button"
            onClick={() => setZoomScale(prev => Math.max(0.7, prev - 0.15))}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
            title="Zoom Out Grid"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-slate-500 font-bold uppercase w-10 text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale(prev => Math.min(1.4, prev + 0.15))}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
            title="Zoom In Grid"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pages Grid Layout */}
      <div 
        className="grid gap-6 justify-center"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${Math.round(150 * zoomScale)}px, 1fr))`
        }}
      >
        {pages.map((page, arrayIdx) => (
          <motion.div
            key={page.index}
            layout
            className={`rounded-2xl glass-panel relative p-3 flex flex-col group/card border transition-all duration-300 ${
              page.selected
                ? 'border-white/10 hover:border-accent-primary/50'
                : 'border-red-500/20 opacity-60 bg-red-950/5'
            }`}
          >
            {/* Index Number Label */}
            <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-extrabold text-white">
              {arrayIdx + 1}
            </div>

            {/* Selection Checkbox */}
            {allowSelection && (
              <button
                type="button"
                onClick={() => toggleSelect(page.index)}
                className="absolute top-2 right-2 z-10 p-1 rounded-lg bg-slate-900/90 border border-white/10 hover:text-accent-primary text-slate-300"
              >
                {page.selected ? (
                  <CheckSquare className="w-4 h-4 text-accent-primary" />
                ) : (
                  <SquareCheck className="w-4 h-4 text-slate-500" />
                )}
              </button>
            )}

            {/* Thumbnail Canvas Frame */}
            <div className="relative aspect-[3/4] bg-slate-950/40 rounded-xl overflow-hidden flex items-center justify-center border border-white/5 mb-3 group-hover/card:bg-slate-950/60 transition-colors">
              <canvas
                ref={el => { canvasRefs.current[page.index] = el; }}
                style={{
                  transform: `rotate(${page.rotation}deg)`,
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                className="max-h-full max-w-full object-contain"
              />

              {/* Hover Zoom Overlay */}
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-2.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                <button
                  type="button"
                  onClick={() => openZoomModal(page.index)}
                  className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 hover:border-white/30 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  title="Zoom Page"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {allowRotation && (
                  <button
                    type="button"
                    onClick={() => rotatePage(page.index, 'cw')}
                    className="w-8 h-8 rounded-lg bg-accent-primary/20 border border-accent-primary/40 hover:border-accent-primary/60 text-accent-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                )}
                {allowDeletion && (
                  <button
                    type="button"
                    onClick={() => deletePage(page.index)}
                    className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 hover:border-red-500/60 text-red-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    title="Remove Page"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Actions Label (visible in static layout) */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold px-1 uppercase tracking-wider">
              <span>Page {page.index + 1}</span>
              {page.rotation > 0 && (
                <span className="text-accent-secondary">{page.rotation}°</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 4. Fullscreen Zoom Modal */}
      <AnimatePresence>
        {zoomModalIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setZoomModalIndex(null)}
          >
            <div 
              className="max-w-2xl w-full bg-slate-900 border border-white/10 rounded-3xl p-6 relative flex flex-col gap-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setZoomModalIndex(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-white font-bold text-base pr-8">
                Page {zoomModalIndex + 1} Preview
              </h3>

              <div className="flex-grow flex items-center justify-center bg-slate-950/50 rounded-2xl border border-white/5 p-4 min-h-[400px] max-h-[600px] overflow-auto">
                {modalCanvasUrl ? (
                  <img
                    src={modalCanvasUrl}
                    alt={`Page ${zoomModalIndex + 1}`}
                    style={{
                      transform: `rotate(${pages.find(p => p.index === zoomModalIndex)?.rotation || 0}deg)`,
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    className="max-h-full max-w-full object-contain shadow-2xl"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
                )}
              </div>

              <div className="flex justify-end gap-2.5">
                {allowRotation && (
                  <button
                    type="button"
                    onClick={() => rotatePage(zoomModalIndex, 'cw')}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs text-white font-bold flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Rotate Page
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setZoomModalIndex(null)}
                  className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-bold hover:bg-accent-primary/95"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
