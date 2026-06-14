'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import { Image, ArrowRight, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PDFToJPGPage() {
  return (
    <ToolPageLayout
      toolPath="/pdf-to-jpg"
      title="PDF to JPG Converter"
      description="Convert each PDF page into a high-quality JPG image. Perfect for thumbnails, presentations, and social media sharing."
      icon="Image"
      color="from-teal-500 to-cyan-600"
      badges={['Coming Soon']}
    >
      <div className="rounded-2xl border-2 border-dashed border-white/10 py-20 px-8 flex flex-col items-center text-center gap-5 bg-slate-950/30">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
          <Image className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-teal-400 font-bold text-sm uppercase tracking-wider">Coming Soon</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">PDF to JPG is Coming</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Export every page of your PDF as a crisp, high-resolution JPG image. Sign up to be notified.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth" className="btn-primary"><ArrowRight className="w-4 h-4" /> Get Notified</Link>
          <Link href="/split" className="btn-ghost">Try Split PDF</Link>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" />Expected launch: Q3 2025</div>
      </div>
    </ToolPageLayout>
  );
}
