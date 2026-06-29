'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield, ShieldCheck, Lock, ChevronDown, Sparkles, Star, FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Upload, Cpu, Globe, Users, Award } from 'lucide-react';
import { Tool } from '@/lib/tools-data';

const ICON_MAP: Record<string, any> = { FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Sparkles };

export default function PopularTools({ popularTools }: { popularTools: any[] }) {
  return (
    <>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <span className="section-label mb-4 inline-flex">
            <Zap className="w-3.5 h-3.5" />
            Most Used
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-3">
            Most Popular Tools
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Start with the tools used by millions — fast, reliable, and fully free.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularTools.map((tool, i) => {
            const Icon = ICON_MAP[tool.icon] || FileText;
            return (
              <motion.div
                key={tool.path}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={tool.path} className="group block h-full">
                  <div className="h-full rounded-2xl glass-panel glass-panel-hover p-6 flex flex-col relative overflow-hidden">
                    <div
                      className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[40px] opacity-30 group-hover:opacity-60 transition-opacity duration-500"
                      style={{ backgroundColor: tool.glow }}
                    />
                    {tool.badge && (
                      <span className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        tool.badge === 'Popular' ? 'badge-popular' :
                        tool.badge === 'New' ? 'badge-new' :
                        tool.badge === 'AI' ? 'badge-ai' : 'badge-popular'
                      }`}>
                        {tool.badge}
                      </span>
                    )}
                    {!tool.isLive && (
                      <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-white/5">
                        Coming Soon
                      </span>
                    )}
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white mb-5 shadow-sm`}>
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-2 group-hover:text-accent-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed flex-grow">{tool.description}</p>
                    <div className="mt-4 text-accent-primary text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open Tool <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>


      
    </>
  );
}
