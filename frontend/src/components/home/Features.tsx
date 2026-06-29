'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield, ShieldCheck, Lock, ChevronDown, Sparkles, Star, FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Upload, Cpu, Globe, Users, Award } from 'lucide-react';

export default function Features({ FEATURES }: { FEATURES: any[] }) {
  return (
    <>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-14">
          <span className="section-label mb-4 inline-flex">
            <Award className="w-3.5 h-3.5" />
            Why DocMaster Pro
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 mb-3">
            Built for Modern Document Workflows
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm">
            Professional tools with consumer-grade simplicity. No bloat. No friction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl glass-panel p-6 flex gap-4 glass-panel-hover"
              >
                <div className={`w-11 h-11 rounded-xl ${feat.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5.5 h-5.5 ${feat.color}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1.5">{feat.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      
    </>
  );
}
