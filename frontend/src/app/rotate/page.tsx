'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const RotatePdfConverter = dynamic(() => import('@/components/RotatePdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading document previewer...</span>
    </div>
  ),
});

export default function RotatePage() {
  return (
    <ToolPageLayout
      toolPath="/rotate"
      title="Rotate PDF"
      description="Rotate individual pages or all pages of your PDF document visually and instantly."
      icon="RotateCw"
      color="from-purple-500 to-violet-600"
      badges={[]}
    >
      <ErrorBoundary>
        <RotatePdfConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}
