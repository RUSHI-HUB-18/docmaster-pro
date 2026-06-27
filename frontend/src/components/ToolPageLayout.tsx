'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, Clock, ArrowRight, ChevronDown, CheckCircle } from 'lucide-react';
import { ALL_TOOLS, getRelatedTools } from '@/lib/tools-data';
import {
  FileText, Combine, Scissors, Minimize, RotateCw, Image,
  Sparkles, Code, Languages, Hash, RefreshCw, BrainCircuit,
  MessageCircle, Wrench, ScanLine, Stamp, PenLine, FileOutput,
  GripVertical, FilePlus, FileCheck, FileSpreadsheet, SpellCheck,
  AlignLeft, Sheet, Table, Expand, MessageSquare, FileType, Layout,
  FileImage, Unlock
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  FileText, Combine, Scissors, Minimize, RotateCw, Image, Sparkles, Code,
  Languages, Hash, RefreshCw, BrainCircuit, MessageCircle, Wrench, ScanLine,
  Stamp, PenLine, FileOutput, GripVertical, FilePlus, FileCheck, FileSpreadsheet,
  SpellCheck, AlignLeft, Sheet, Table, Expand, MessageSquare, FileType, Layout,
  FileImage, Unlock, ImageIcon: Image,
};

interface ToolFAQ {
  question: string;
  answer: string;
}

interface ToolPageLayoutProps {
  toolPath: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  badges?: string[];
  faqs?: ToolFAQ[];
  children: React.ReactNode;
}

export default function ToolPageLayout({
  toolPath,
  title,
  description,
  icon,
  color,
  badges = [],
  faqs = [],
  children,
}: ToolPageLayoutProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const related = getRelatedTools(toolPath, 4);
  const Icon = ICON_MAP[icon] || FileText;

  const defaultFaqs: ToolFAQ[] = [
    {
      question: 'How secure is this tool?',
      answer: 'All files are processed in isolated server sandboxes and automatically deleted 10 minutes after upload. No human has access to your files, and all transfers are encrypted via SSL/HTTPS.',
    },
    {
      question: 'What is the maximum file size?',
      answer: 'You can upload files up to 50MB per operation. For larger files, consider compressing them first.',
    },
    {
      question: 'Are my files stored permanently?',
      answer: 'No. Files are deleted from our servers exactly 10 minutes after processing. You can also manually delete them from the Download Center at any time.',
    },
  ];

  const allFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="w-full pb-20">
      {/* ── Tool Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-accent-primary/10 rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {badges.map(badge => (
              <span
                key={badge}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border badge-popular"
              >
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
            {title}
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed">
            {description}
          </p>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            {[
              { Icon: Shield, text: 'SSL Encrypted' },
              { Icon: Clock, text: '10-Minute Auto Delete' },
              { Icon: Lock, text: 'No Account Needed' },
              { Icon: CheckCircle, text: '100% Free' },
            ].map(({ Icon: TIcon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-slate-400">
                <TIcon className="w-3.5 h-3.5 text-accent-primary" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool Content (children) ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </section>

      {/* ── Security Notice ────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">Your files are safe with us</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              All uploaded files are processed in isolated server containers and permanently deleted exactly 10 minutes after upload.
              No file content is ever inspected, shared, or logged. All data transfer is SSL/TLS encrypted.
            </p>
          </div>
        </div>
      </section>

      {/* ── Related Tools ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-primary" />
            Related Tools
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(tool => {
              const TIcon = ICON_MAP[tool.icon] || FileText;
              return (
                <Link key={tool.path} href={tool.path} className="group">
                  <div className="rounded-xl glass-panel p-4 flex flex-col gap-3 glass-panel-hover h-full">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${tool.color} flex items-center justify-center`}>
                      <TIcon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-accent-primary transition-colors">{tool.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{tool.description}</div>
                    </div>
                    <div className="text-accent-primary text-[11px] font-bold flex items-center gap-1 mt-auto group-hover:gap-1.5 transition-all">
                      Open <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <h2 className="text-xl font-extrabold text-white mb-6">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-3">
          {allFaqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-slate-950/50 hover:bg-slate-950/80 transition-colors overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                >
                  <span className="font-bold text-white text-sm">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-accent-primary' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
