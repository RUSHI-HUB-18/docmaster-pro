'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield, ShieldCheck, Lock, ChevronDown, Sparkles, Star, FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Upload, Cpu, Globe, Users, Award } from 'lucide-react';

export default function FinalCta() {
  return (
    <>

      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-accent-primary/20 via-purple-600/15 to-accent-secondary/15 border border-accent-primary/20 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative">
            <Sparkles className="w-10 h-10 text-accent-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Ready to Process Your First Document?
            </h2>
            <p className="text-slate-400 mb-8 text-base max-w-lg mx-auto">
              No account. No software. No waiting. 40+ tools available right now, completely free.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/pdf" className="btn-primary text-base px-8 py-4">
                Start with PDF <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/ai-tools" className="btn-ghost text-base px-8 py-4">
                <Sparkles className="w-4 h-4" />
                Try AI Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
