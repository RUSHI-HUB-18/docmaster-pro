'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield, ShieldCheck, Lock, ChevronDown, Sparkles, Star, FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit, Languages, FileType, Presentation, Sheet, Upload, Cpu, Globe, Users, Award } from 'lucide-react';

export default function SecurityPrivacy() {
  return (
    <>

      <section id="security" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 w-full">
        <div className="rounded-3xl glass-panel p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col gap-6 relative">
            <span className="section-label self-start">
              <Shield className="w-3.5 h-3.5" />
              Security Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Your documents stay <span className="gradient-text-primary">completely private.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              DocMaster Pro operates like a local tool — except powered by the cloud. Files are sent over SSL to an isolated sandbox, 
              processed, and scheduled for permanent deletion. No human review, no data mining, no caching.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { Icon: ShieldCheck, title: 'Sandbox Isolation', desc: 'Unique isolated folder per request. Never shared.' },
                { Icon: Lock, title: 'SSL Encryption', desc: 'All transfers are TLS 1.3 encrypted end-to-end.' },
                { Icon: Clock, title: 'Auto Deletion', desc: 'Files wiped automatically after 10 minutes.' },
                { Icon: CheckCircle, title: 'No Logging', desc: 'Zero file content inspection or logging.' },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5">
                  <Icon className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold text-xs">{title}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal mock */}
          <div className="bg-black/30 border border-white/8 rounded-2xl p-6 font-mono text-[12px] relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="text-[10px] text-slate-500 font-sans">Secure Processing Log</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex flex-col gap-2.5 text-slate-400">
              <div><span className="text-emerald-400">$</span> Initializing isolated sandbox #A87-99...</div>
              <div><span className="text-emerald-400">✓</span> SSL handshake complete [TLS 1.3]</div>
              <div><span className="text-emerald-400">✓</span> File uploaded to /tmp/sandbox-A87-99/</div>
              <div><span className="text-blue-400">›</span> Processing: merging pages 1..12</div>
              <div><span className="text-blue-400">›</span> Compression ratio: 0.62 applied</div>
              <div><span className="text-accent-primary">⏱</span> Deletion timer: 59m 58s remaining</div>
              <div className="text-emerald-400">✓ Operation complete. File ready for download.</div>
            </div>
          </div>
        </div>
      </section>


      
    </>
  );
}
