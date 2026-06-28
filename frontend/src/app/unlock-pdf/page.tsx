'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';

const UnlockPdfConverter = dynamic(() => import('@/components/UnlockPdfConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading decrypter workspace...</span>
    </div>
  ),
});

export default function UnlockPDFPage() {
  return (
    <ToolPageLayout
      toolPath="/unlock-pdf"
      title="Unlock PDF"
      description="Remove passwords and unlock restricted PDF files instantly. Free, secure, and completed entirely in-browser."
      icon="Unlock"
      color="from-emerald-500 to-green-600"
      badges={['Popular']}
    >
      <UnlockPdfConverter />
    </ToolPageLayout>
  );
}
