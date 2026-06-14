'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import { FilePlus, ArrowRight, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function WordToPDFPage() {
  return (
    <ToolPageLayout
      toolPath="/word-to-pdf"
      title="Word to PDF Converter"
      description="Convert Microsoft Word documents (.docx) to PDF format instantly. Preserve all formatting, fonts, and layouts perfectly."
      icon="FilePlus"
      color="from-indigo-500 to-blue-600"
      badges={['Popular', 'Coming Soon']}
    >
      <div className="rounded-2xl border-2 border-dashed border-white/10 py-20 px-8 flex flex-col items-center text-center gap-5 bg-slate-950/30">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
          <FilePlus className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-400 font-bold text-sm uppercase tracking-wider">Coming Soon</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Word to PDF is in Development</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            One-click Word to PDF conversion with perfect layout fidelity. Sign up to be first in line.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth" className="btn-primary"><ArrowRight className="w-4 h-4" /> Get Notified</Link>
          <Link href="/merge" className="btn-ghost">Try Merge PDF</Link>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" />Expected launch: Q3 2025</div>
      </div>
    </ToolPageLayout>
  );
}
