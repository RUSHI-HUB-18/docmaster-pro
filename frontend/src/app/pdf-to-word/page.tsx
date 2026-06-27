'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import { FileText, Sparkles, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PDFToWordPage() {
  return (
    <ToolPageLayout
      toolPath="/pdf-to-word"
      title="PDF to Word Converter"
      description="Convert any PDF document into a fully editable Microsoft Word file. Preserve layouts, fonts, tables, and images with high fidelity."
      icon="FileText"
      color="from-blue-500 to-indigo-600"
      badges={['Popular', 'Coming Soon']}
      faqs={[
        { question: 'Will my PDF formatting be preserved?', answer: 'Yes. Our engine preserves fonts, tables, columns, headers, footers, and embedded images with high accuracy.' },
        { question: 'Can I convert scanned PDFs to Word?', answer: 'Scanned PDFs require OCR processing. Our OCR PDF tool (coming soon) will handle this automatically before conversion.' },
        { question: 'What Word formats are supported?', answer: 'We output standard .docx format compatible with Microsoft Word 2016+, Google Docs, and LibreOffice.' },
      ]}
    >
      {/* Coming Soon State */}
      <div className="rounded-2xl border-2 border-dashed border-white/10 py-20 px-8 flex flex-col items-center text-center gap-5 bg-slate-950/30">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <span className="text-accent-primary font-bold text-sm uppercase tracking-wider">Coming Soon</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">PDF to Word is in Development</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            We&apos;re building a high-fidelity PDF-to-Word engine. Sign up to get notified when it launches.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth" className="btn-primary">
            Get Notified <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/merge" className="btn-ghost">
            Try Merge PDF
          </Link>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          Expected launch: Q3 2025
        </div>
      </div>
    </ToolPageLayout>
  );
}
