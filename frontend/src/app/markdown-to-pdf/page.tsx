'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const MarkdownToPdfConverter = dynamic(() => import('@/components/MarkdownToPdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading Markdown converter...</span>
    </div>
  ),
});

export default function MarkdownToPdfPage() {
  return (
    <ToolPageLayout
      toolPath="/markdown-to-pdf"
      title="Markdown to PDF"
      description="Convert Markdown (.md) files to beautifully styled PDF documents with live preview. Choose from Classic, Modern, or Minimal themes."
      icon="FileCode"
      color="from-purple-500 to-violet-600"
      badges={['New']}
    >
      <ErrorBoundary>
        <MarkdownToPdfConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}
