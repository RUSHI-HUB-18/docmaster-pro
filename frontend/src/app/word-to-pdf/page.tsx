'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const WordToPdfConverter = dynamic(() => import('@/components/WordToPdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading document compiler...</span>
    </div>
  ),
});

export default function WordToPDFPage() {
  return (
    <ToolPageLayout
      toolPath="/word-to-pdf"
      title="Word to PDF Converter"
      description="Convert Microsoft Word documents (.docx) to PDF format instantly. Preserve all formatting, fonts, and layouts perfectly."
      icon="FilePlus"
      color="from-indigo-500 to-blue-600"
      badges={['Popular']}
    >
      <ErrorBoundary>
        <WordToPdfConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}

