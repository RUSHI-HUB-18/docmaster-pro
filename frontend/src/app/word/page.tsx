'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileType, Shield, ChevronDown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getToolsByCategory, getGroupsByCategory } from '@/lib/tools-data';
import { FileText, Code, Languages, Hash, RefreshCw, SpellCheck, AlignLeft } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  FileText, Code, Languages, Hash, RefreshCw, SpellCheck, AlignLeft, Sparkles,
  FileType,
};

export default function WordCategoryPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const tools = getToolsByCategory('word');
  const groups = getGroupsByCategory('word');

  const faqs = [
    { question: 'Will my Word formatting be preserved when converting to PDF?', answer: 'Yes. Our Word to PDF engine preserves fonts, tables, images, headers, and footers with high fidelity.' },
    { question: 'Can AI tools work on any language?', answer: 'Our AI Summarizer and Translator support 50+ languages. Grammar Check currently focuses on English.' },
    { question: 'Is there a size limit for Word files?', answer: 'Word files up to 50MB are supported. Large files with many embedded images may take slightly longer.' },
  ];

  return (
    <div className="w-full pb-20">
      {/* Hero */}
      <section className="relative pt-16 pb-14 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-xl shadow-sky-500/20 mx-auto mb-5">
              <FileType className="w-8 h-8 text-white" />
            </div>
            <span className="section-label mb-4 inline-flex">Word Category · {tools.length} Tools</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4 leading-tight">
              Professional <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Word</span> Document Tools
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Convert, edit, and enhance Word documents with AI-powered tools. From simple format conversion to intelligent content rewriting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/8 p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-violet-400 shrink-0" />
          <p className="text-sm text-slate-300">
            <span className="font-bold text-violet-300">Coming Soon:</span> Word tools are currently in development. Sign up to get early access when they launch.
          </p>
          <Link href="/auth" className="shrink-0 text-xs font-bold text-violet-300 hover:text-violet-200 flex items-center gap-1 ml-auto">
            Get Notified <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Tool Groups */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {groups.map((group) => {
          const groupTools = tools.filter(t => t.group === group);
          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-extrabold text-white">{group}</h2>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupTools.map((tool, i) => {
                  const Icon = ICON_MAP[tool.icon] || FileText;
                  return (
                    <motion.div key={tool.path} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                      <div className="relative">
                        <div className="h-full rounded-xl glass-panel p-5 flex flex-col gap-3 opacity-70">
                          <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${tool.color} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            {tool.badge && (
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${tool.badge === 'AI' ? 'badge-ai' : 'badge-popular'}`}>{tool.badge}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-sm">{tool.name}</h3>
                            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{tool.description}</p>
                          </div>
                        </div>
                        {/* Coming soon overlay */}
                        <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-white/8">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-extrabold text-white mb-6">Word Tools FAQ</h2>
        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => {
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
