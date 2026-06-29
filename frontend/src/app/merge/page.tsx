'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const MergePdfConverter = dynamic(() => import('@/components/MergePdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading document compiler...</span>
    </div>
  ),
});

export default function MergePage() {
  return (
    <ToolPageLayout
      toolPath="/merge"
      title="Merge PDF"
      description="Combine multiple PDF files into one document quickly and securely on your own device."
      icon="Combine"
      color="from-blue-500 to-indigo-600"
      badges={['Popular']}
    >
      <ErrorBoundary>
        <MergePdfConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}
