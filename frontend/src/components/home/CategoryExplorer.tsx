'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield, ShieldCheck, Lock, ChevronDown, Sparkles, Star, FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Upload, Cpu, Globe, Users, Award } from 'lucide-react';
import { CATEGORY_META } from '@/lib/tools-data';
const ICON_MAP: Record<string, any> = { FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Sparkles };

export default function CategoryExplorer() {
  return (
    <>

      <section id="tools" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 w-full">
        <div className="text-center mb-12">
          <span className="section-label mb-4 inline-flex">
            <FileText className="w-3.5 h-3.5" />
            Document Categories
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-3">
            Every Document Format, Covered
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Six powerful categories. From PDF conversion to AI generation — all the tools your workflow needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_META.map((cat, i) => {
            const Icon = ICON_MAP[cat.icon] || FileText;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={cat.path} className="group block h-full">
                  <div className="rounded-2xl glass-panel glass-panel-hover p-5 flex flex-col items-center text-center gap-3 h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      {React.createElement(Icon as any, { className: "w-6 h-6 text-white" })}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm group-hover:text-accent-primary transition-colors">{cat.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{cat.toolCount} tools</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <hr className="section-divider" />

      
    </>
  );
}
