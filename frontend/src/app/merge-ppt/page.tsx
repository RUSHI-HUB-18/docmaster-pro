'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';

const MergePptConverter = dynamic(() => import('@/components/MergePptConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading merger workspace...</span>
    </div>
  ),
});

export default function MergePPTPage() {
  return (
    <ToolPageLayout
      toolPath="/merge-ppt"
      title="Merge PowerPoint"
      description="Combine multiple PowerPoint presentations (.pptx) into a single slideshow file sequentially. Adapt templates easily."
      icon="Combine"
      color="from-orange-500 to-amber-600"
      badges={[]}
    >
      <MergePptConverter />
    </ToolPageLayout>
  );
}
