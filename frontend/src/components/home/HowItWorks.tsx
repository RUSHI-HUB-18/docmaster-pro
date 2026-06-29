'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield, ShieldCheck, Lock, ChevronDown, Sparkles, Star, FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Upload, Cpu, Globe, Users, Award } from 'lucide-react';

export default function HowItWorks({ HOW_IT_WORKS }: { HOW_IT_WORKS: any[] }) {
  return (
    <>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-14">
          <span className="section-label mb-4 inline-flex">
            <CheckCircle className="w-3.5 h-3.5" />
            3 Easy Steps
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />

          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center gap-5"
              >
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-tr ${step.color} flex items-center justify-center shadow-xl`}>
                  <Icon className="w-9 h-9 text-white" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border border-white/10 text-[10px] font-extrabold text-white flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <hr className="section-divider" />

      
    </>
  );
}
