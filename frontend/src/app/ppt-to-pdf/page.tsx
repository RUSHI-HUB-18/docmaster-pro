'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const PptToPdfConverter = dynamic(() => import('@/components/PptToPdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading conversion engine...</span>
    </div>
  ),
});

export default function PPTToPDFPage() {
  return (
    <ToolPageLayout
      toolPath="/ppt-to-pdf"
      title="PowerPoint to PDF Converter"
      description="Convert your PowerPoint presentations (.pptx) to landscape PDF documents. High visual accuracy and offline protection."
      icon="FileCheck"
      color="from-orange-500 to-red-600"
      badges={['Popular']}
    >
      <ErrorBoundary>
        <PptToPdfConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}
