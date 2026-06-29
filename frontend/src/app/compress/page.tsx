'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CompressPdfConverter = dynamic(() => import('@/components/CompressPdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading optimization tools...</span>
    </div>
  ),
});

export default function CompressPage() {
  return (
    <ToolPageLayout
      toolPath="/compress"
      title="Compress PDF"
      description="Reduce the file size of your PDF files while maintaining optimal quality."
      icon="Minimize"
      color="from-amber-500 to-orange-600"
      badges={['Popular']}
    >
      <ErrorBoundary>
        <CompressPdfConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}
