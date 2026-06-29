'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield, ShieldCheck, Lock, ChevronDown, Sparkles, Star, FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Upload, Cpu, Globe, Users, Award } from 'lucide-react';

export default function SupportedFormats({ FORMATS }: { FORMATS: any[] }) {
  return (
    <>

      <section className="bg-slate-950/50 border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-white mb-2">Supported Formats</h2>
            <p className="text-slate-400 text-sm">Input and output across 12+ popular file formats</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {FORMATS.map((fmt) => (
              <div
                key={fmt.name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel border border-white/6 hover:border-white/12 transition-all hover:-translate-y-0.5"
              >
                <span className="text-lg leading-none">{fmt.icon}</span>
                <span className={`text-sm font-bold ${fmt.color}`}>{fmt.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      
    </>
  );
}
