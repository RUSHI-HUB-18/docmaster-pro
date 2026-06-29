'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const CompressPptConverter = dynamic(() => import('@/components/CompressPptConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-secondary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading compressor module...</span>
    </div>
  ),
});

export default function CompressPPTPage() {
  return (
    <ToolPageLayout
      toolPath="/compress-ppt"
      title="Compress PowerPoint"
      description="Reduce the file size of your PowerPoint presentations without compromising quality. Perfect for email attachments and cloud storage."
      icon="Minimize"
      color="from-rose-500 to-pink-600"
      badges={[]}
    >
      <ErrorBoundary>
        <CompressPptConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}

