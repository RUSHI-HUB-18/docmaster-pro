'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield, ShieldCheck, Lock, ChevronDown, Sparkles, Star, FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Upload, Cpu, Globe, Users, Award } from 'lucide-react';

export default function Faq({ FAQS, openFaq, setOpenFaq }: { FAQS: any[], openFaq: number | null, setOpenFaq: (i: number | null) => void }) {
  return (
    <>

      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-950/70 transition-colors overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                >
                  <span className="font-bold text-white text-sm">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-accent-primary' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      
    </>
  );
}
