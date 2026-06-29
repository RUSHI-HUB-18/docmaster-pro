'use client';

import React from 'react';
import ToolPageLayout from '@/components/ToolPageLayout';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const PdfToWordConverter = dynamic(() => import('@/components/PdfToWordConverter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-3xl glass-panel flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      <span className="text-slate-400 text-xs font-semibold">Loading conversion engine...</span>
    </div>
  ),
});

export default function PDFToWordPage() {
  return (
    <ToolPageLayout
      toolPath="/pdf-to-word"
      title="PDF to Word Converter"
      description="Convert any PDF document into a fully editable Microsoft Word file. Preserve layouts, fonts, tables, and images with high fidelity."
      icon="FileText"
      color="from-blue-500 to-indigo-600"
      badges={['Popular']}
      faqs={[
        { question: 'Will my PDF formatting be preserved?', answer: 'Yes. Our engine preserves fonts, tables, columns, headers, footers, and embedded images with high accuracy.' },
        { question: 'Can I convert scanned PDFs to Word?', answer: 'Scanned PDFs require OCR processing. Our OCR PDF tool (coming soon) will handle this automatically before conversion.' },
        { question: 'What Word formats are supported?', answer: 'We output standard .docx format compatible with Microsoft Word 2016+, Google Docs, and LibreOffice.' },
      ]}
    >
      <ErrorBoundary>
        <PdfToWordConverter />
      </ErrorBoundary>
    </ToolPageLayout>
  );
}

