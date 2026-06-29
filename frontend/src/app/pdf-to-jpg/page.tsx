'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const PdfToJpgConverter = dynamic(() => import('@/components/PdfToJpgConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading converter module...</span>
    </div>
  ),
});

export default function PDFToJPGPage() {
  return (
    <ToolPageLayout
      toolPath="/pdf-to-jpg"
      title="PDF to JPG Converter"
      description="Convert each PDF page into a high-quality JPG image. Perfect for thumbnails, presentations, and social media sharing."
      icon="Image"
      color="from-teal-500 to-cyan-600"
      badges={[]}
    >
      <ErrorBoundary>
        <PdfToJpgConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}

