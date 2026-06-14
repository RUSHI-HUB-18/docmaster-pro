'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Presentation, Sparkles, Minimize, Combine, MessageSquare, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { getToolsByCategory, getGroupsByCategory } from '@/lib/tools-data';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Minimize, Combine, Sparkles, MessageSquare, Presentation,
  Image: FileText, Layout: FileText,
};

export default function PowerPointCategoryPage() {
  const tools = getToolsByCategory('powerpoint');
  const groups = getGroupsByCategory('powerpoint');

  return (
    <div className="w-full pb-20">
      <section className="relative pt-16 pb-14 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-600 flex items-center justify-center shadow-xl shadow-orange-500/20 mx-auto mb-5">
              <Presentation className="w-8 h-8 text-white" />
            </div>
            <span className="section-label mb-4 inline-flex">PowerPoint Category · {tools.length} Tools</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4">
              Create & Convert <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Presentations</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Convert, compress, and AI-generate stunning presentations in seconds.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/8 p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-orange-400 shrink-0" />
          <p className="text-sm text-slate-300">
            <span className="font-bold text-orange-300">Coming Soon:</span> PowerPoint tools are launching soon. Be the first to know.
          </p>
          <Link href="/auth" className="shrink-0 text-xs font-bold text-orange-300 ml-auto flex items-center gap-1">
            Get Notified <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

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
                        <div className="h-full rounded-xl glass-panel p-5 flex flex-col gap-3 opacity-60">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${tool.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-sm">{tool.name}</h3>
                            <p className="text-slate-400 text-[11px] mt-1">{tool.description}</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-white/8">Coming Soon</span>
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
    </div>
  );
}
