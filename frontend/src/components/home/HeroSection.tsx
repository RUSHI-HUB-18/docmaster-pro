'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield, ShieldCheck, Lock, ChevronDown, Sparkles, Star, FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Upload, Cpu, Globe, Users, Award } from 'lucide-react';

export default function HeroSection({ headlineIndex, HEADLINES }: { headlineIndex: number, HEADLINES: string[] }) {
  return (
    <>

      <section className="relative pt-20 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Background glows (fallbacks/accents over the 3D layer) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-accent-secondary/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-20 left-0 w-64 h-64 bg-accent-tertiary/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="section-label">
              <Sparkles className="w-3.5 h-3.5" />
              40+ Document Tools · 100% Free · No Sign-up
            </span>
          </motion.div>

          {/* Animated Headline */}
          <div className="h-[90px] sm:h-[100px] md:h-[140px] flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              <motion.h1
                key={headlineIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]"
              >
                {HEADLINES[headlineIndex].split(' ').map((word, wi) => {
                  const highlight = ['Documents', 'PDF,', 'Instantly', 'Simplified', 'Place'].includes(word);
                  return (
                    <span key={wi} className={highlight ? 'gradient-text-primary' : 'text-white'}>
                      {word}{' '}
                    </span>
                  );
                })}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Merge, split, compress, rotate, convert and manage PDF, Word, PPT, Excel, and image files. 
            Powered by AI. Completely free. No account needed.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-14"
          >
            <a href="#tools" className="btn-primary text-base px-8 py-4 group">
              Explore All Tools
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link href="/pdf" className="btn-ghost text-base px-8 py-4">
              PDF Tools
            </Link>
          </motion.div>

          {/* Floating format badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2.5"
          >
            {['PDF', 'DOCX', 'PPTX', 'XLSX', 'JPG', 'PNG', 'AI Powered'].map((fmt, i) => (
              <span
                key={fmt}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  fmt === 'AI Powered'
                    ? 'bg-violet-500/10 border-violet-500/25 text-violet-300'
                    : 'bg-white/4 border-white/8 text-slate-400'
                } animate-float`}
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {fmt}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <hr className="section-divider" />

      
    </>
  );
}
