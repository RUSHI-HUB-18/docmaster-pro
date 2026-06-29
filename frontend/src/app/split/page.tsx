'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const SplitPdfConverter = dynamic(() => import('@/components/SplitPdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading document splitter...</span>
    </div>
  ),
});

export default function SplitPage() {
  return (
    <ToolPageLayout
      toolPath="/split"
      title="Split PDF"
      description="Split a PDF document into individual pages or custom ranges instantly in your browser."
      icon="Scissors"
      color="from-pink-500 to-rose-600"
      badges={[]}
    >
      <ErrorBoundary>
        <SplitPdfConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}
