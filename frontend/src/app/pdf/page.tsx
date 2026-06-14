'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Combine, Scissors, Minimize, RotateCw, Lock, Unlock, Stamp, PenLine, FileOutput, GripVertical, FilePlus, FileCheck, FileSpreadsheet, ScanLine, Wrench, Image, Shield, ChevronDown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getToolsByCategory, getGroupsByCategory } from '@/lib/tools-data';
import { useState } from 'react';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Combine, Scissors, Minimize, RotateCw, Lock, Unlock, Stamp, PenLine,
  FileOutput, GripVertical, FilePlus, FileCheck, FileSpreadsheet, ScanLine, Wrench, Image, ImageIcon: Image
};

const PDF_FAQS = [
  { question: 'Can I merge password-protected PDFs?', answer: 'Currently, password-protected PDFs must be unlocked before merging. Use our Unlock PDF tool first, then merge.' },
  { question: 'What is the maximum number of pages I can split?', answer: 'There is no page limit. You can split PDFs of any size up to our 50MB file size limit.' },
  { question: 'Does compression affect PDF quality?', answer: 'Our Basic mode has zero quality loss. Medium and Strong modes slightly reduce image resolution within embedded content.' },
  { question: 'Is OCR available for scanned PDFs?', answer: 'Yes — our OCR PDF tool (coming soon) will make scanned documents fully searchable and selectable.' },
];

export default function PDFCategoryPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const tools = getToolsByCategory('pdf');
  const groups = getGroupsByCategory('pdf');

  return (
    <div className="w-full pb-20">
      {/* Hero */}
      <section className="relative pt-16 pb-14 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-72 bg-accent-primary/12 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="section-label mb-4 inline-flex">PDF Category · {tools.length} Tools</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4 leading-tight">
              Everything You Need for <span className="gradient-text-primary">PDF</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Convert, organize, secure, and optimize PDF documents with our complete suite of professional tools.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tool Groups */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {groups.map((group, gi) => {
          const groupTools = tools.filter(t => t.group === group);
          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-extrabold text-white">{group}</h2>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs text-slate-500">{groupTools.length} tools</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {groupTools.map((tool, i) => {
                  const Icon = ICON_MAP[tool.icon] || FileText;
                  return (
                    <motion.div
                      key={tool.path}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link href={tool.path} className="group block h-full">
                        <div className="h-full rounded-xl glass-panel p-5 flex flex-col gap-3 relative overflow-hidden glass-panel-hover">
                          <div
                            className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-[30px] opacity-20 group-hover:opacity-40 transition-opacity"
                            style={{ backgroundColor: tool.glow }}
                          />
                          <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${tool.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {tool.badge && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                  tool.badge === 'Popular' ? 'badge-popular' :
                                  tool.badge === 'New' ? 'badge-new' :
                                  tool.badge === 'AI' ? 'badge-ai' : 'badge-popular'
                                }`}>{tool.badge}</span>
                              )}
                              {!tool.isLive && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-white/5">Soon</span>
                              )}
                              {tool.isLive && (
                                <span className="text-[9px] px-2 py-0.5 rounded-full badge-live">Live</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-sm group-hover:text-accent-primary transition-colors">{tool.name}</h3>
                            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{tool.description}</p>
                          </div>
                          <div className="mt-auto text-accent-primary text-[11px] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Open <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Security note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5 flex items-center gap-4">
          <Shield className="w-6 h-6 text-emerald-400 shrink-0" />
          <p className="text-slate-400 text-sm">All PDF operations run in isolated server sandboxes. Files are permanently deleted 1 hour after processing. No registration required.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-extrabold text-white mb-6">PDF Tools FAQ</h2>
        <div className="flex flex-col gap-3">
          {PDF_FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="rounded-xl border border-white/5 bg-slate-950/40 overflow-hidden">
                <button onClick={() => setOpenFaq(isOpen ? null : i)} className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left">
                  <span className="font-bold text-white text-sm">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-accent-primary' : ''}`} />
                </button>
                {isOpen && <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-3">{faq.answer}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
