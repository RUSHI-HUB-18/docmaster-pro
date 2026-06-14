'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Image, Sparkles, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImagesCategoryPage() {
  return (
    <div className="w-full pb-20">
      <section className="relative min-h-[70vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/8 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center shadow-2xl shadow-teal-500/30 animate-float">
              <Image className="w-10 h-10 text-white" />
            </div>
            <div>
              <span className="section-label mb-4 inline-flex"><Sparkles className="w-3.5 h-3.5" />Coming Soon</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-4 mb-4">
                Image Tools <span className="bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">Launching Soon</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Compress, resize, convert, and optimize images across all popular formats — JPG, PNG, WebP, AVIF, and more.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {['Compress Image', 'Resize Image', 'Convert Format', 'Image to PDF', 'Remove Background', 'Crop Image'].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/8 text-slate-300">{t}</span>
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              <Link href="/auth" className="btn-primary">
                <Bell className="w-4 h-4" /> Get Notified
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
