'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import { Minimize, ArrowRight, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CompressPPTPage() {
  return (
    <ToolPageLayout
      toolPath="/compress-ppt"
      title="Compress PowerPoint"
      description="Reduce the file size of your PowerPoint presentations without compromising quality. Perfect for email attachments and cloud storage."
      icon="Minimize"
      color="from-rose-500 to-pink-600"
      badges={['Coming Soon']}
    >
      <div className="rounded-2xl border-2 border-dashed border-white/10 py-20 px-8 flex flex-col items-center text-center gap-5 bg-slate-950/30">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Minimize className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-rose-400 font-bold text-sm uppercase tracking-wider">Coming Soon</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">PPT Compressor is Coming</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Shrink large PowerPoint files by up to 80% while keeping all animations and visuals intact.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth" className="btn-primary"><ArrowRight className="w-4 h-4" /> Get Notified</Link>
          <Link href="/compress" className="btn-ghost">Try PDF Compressor</Link>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" />Expected launch: Q4 2025</div>
      </div>
    </ToolPageLayout>
  );
}
