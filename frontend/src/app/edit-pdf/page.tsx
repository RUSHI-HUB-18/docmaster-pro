'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const EditPdfConverter = dynamic(() => import('@/components/EditPdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading PDF editor...</span>
    </div>
  ),
});

export default function EditPdfPage() {
  return (
    <ToolPageLayout
      toolPath="/edit-pdf"
      title="Edit PDF Text"
      description="Click on any text in your PDF to edit it directly. Font size and style automatically match the surrounding document text. 100% client-side."
      icon="Pencil"
      color="from-emerald-500 to-teal-600"
      badges={['New']}
    >
      <ErrorBoundary>
        <EditPdfConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}
