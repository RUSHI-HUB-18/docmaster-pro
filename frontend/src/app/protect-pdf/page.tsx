'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import { Lock, ArrowRight, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ProtectPDFPage() {
  return (
    <ToolPageLayout
      toolPath="/protect-pdf"
      title="Protect PDF with Password"
      description="Add password protection to your PDF files. Prevent unauthorized access, printing, and copying of sensitive documents."
      icon="Lock"
      color="from-red-500 to-rose-600"
      badges={['Coming Soon']}
    >
      <div className="rounded-2xl border-2 border-dashed border-white/10 py-20 px-8 flex flex-col items-center text-center gap-5 bg-slate-950/30">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Coming Soon</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">PDF Protection is Coming</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Add 256-bit AES encryption and custom passwords to your PDFs. Sign up to get notified.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth" className="btn-primary"><ArrowRight className="w-4 h-4" /> Get Notified</Link>
          <Link href="/compress" className="btn-ghost">Try Compress PDF</Link>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" />Expected launch: Q4 2025</div>
      </div>
    </ToolPageLayout>
  );
}
