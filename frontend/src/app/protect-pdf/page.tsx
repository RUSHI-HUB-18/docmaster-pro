'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const ProtectPdfConverter = dynamic(() => import('@/components/ProtectPdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading security module...</span>
    </div>
  ),
});

export default function ProtectPDFPage() {
  return (
    <ToolPageLayout
      toolPath="/protect-pdf"
      title="Protect PDF with Password"
      description="Add password protection to your PDF files. Prevent unauthorized access, printing, and copying of sensitive documents."
      icon="Lock"
      color="from-red-500 to-rose-600"
      badges={[]}
    >
      <ErrorBoundary>
        <ProtectPdfConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}

