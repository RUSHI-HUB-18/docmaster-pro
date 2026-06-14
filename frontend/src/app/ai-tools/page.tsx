'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, BrainCircuit, Bell, MessageCircle, Languages } from 'lucide-react';
import { motion } from 'framer-motion';

const AI_PREVIEW_TOOLS = [
  { name: 'AI Chat with PDF', desc: 'Ask questions about your documents', icon: MessageCircle, color: 'from-violet-500 to-purple-600' },
  { name: 'AI Summarizer', desc: 'Get concise document summaries', icon: Sparkles, color: 'from-indigo-500 to-violet-600' },
  { name: 'AI Translator', desc: 'Translate documents to 50+ languages', icon: Languages, color: 'from-blue-500 to-indigo-600' },
  { name: 'AI Writer', desc: 'Generate professional content', icon: BrainCircuit, color: 'from-purple-500 to-pink-600' },
];

export default function AIToolsCategoryPage() {
  return (
    <div className="w-full pb-20">
      <section className="relative pt-16 pb-14 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-72 bg-violet-500/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 animate-float">
              <BrainCircuit className="w-10 h-10 text-white" />
            </div>
            <div>
              <span className="section-label mb-4 inline-flex"><Sparkles className="w-3.5 h-3.5" />AI-Powered · Coming Soon</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4 leading-tight">
                AI Tools for the <span className="gradient-text-primary">Modern Document Workflow</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
                DocMaster Pro is building an intelligent document layer — chat with PDFs, auto-summarize reports, translate in real-time, and generate content from scratch.
              </p>
            </div>

            {/* Preview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-4">
              {AI_PREVIEW_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div key={tool.name} className="relative rounded-xl glass-panel p-4 flex flex-col gap-3 opacity-75">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${tool.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs">{tool.name}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{tool.desc}</div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] font-bold badge-ai px-1.5 py-0.5 rounded-full">AI</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-4">
              <Link href="/auth" className="btn-primary">
                <Bell className="w-4 h-4" /> Get Early Access
              </Link>
              <Link href="/pdf" className="btn-ghost">
                Try PDF Tools <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
