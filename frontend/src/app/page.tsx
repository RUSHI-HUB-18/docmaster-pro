'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, TrendingDown, Zap, Clock, Shield,
  ShieldCheck, Lock, ChevronDown, Sparkles, Star,
  FileText, Combine, Scissors, Minimize, RotateCw,
  Image, BrainCircuit, Languages, FileType, Presentation,
  Sheet, Upload, Cpu, Globe, Users, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_META, getPopularTools } from '@/lib/tools-data';
import dynamic from 'next/dynamic';

const Hero3DBackground = dynamic(() => import('@/components/Hero3DBackground'), { ssr: false });

const ICON_MAP: Record<string, any> = {
  FileText, Combine, Scissors, Minimize, RotateCw, Image, BrainCircuit,
  Languages, FileType, Presentation, Sheet, Sparkles,
};

const HEADLINES = [
  'All Your Document Tools in One Place',
  'Convert, Edit & Manage Documents Instantly',
  'The Modern Workspace for PDF, Word & More',
  'Professional Document Processing, Simplified',
];

const STATS = [
  { label: 'Files Processed', value: '2.4M+', icon: CheckCircle, color: 'text-emerald-400' },
  { label: 'Size Reduction', value: '62%', icon: TrendingDown, color: 'text-accent-primary' },
  { label: 'Avg. Speed', value: '< 2s', icon: Zap, color: 'text-yellow-400' },
  { label: 'Auto Cleanup', value: '10 Min', icon: Clock, color: 'text-pink-400' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload Your File',
    description: 'Drag and drop or click to upload any PDF, Word, PPT, Excel, or image file up to 50MB.',
    icon: Upload,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    step: '02',
    title: 'Choose Your Operation',
    description: 'Select from 40+ tools. Merge, split, compress, convert, rotate, or use AI-powered tools.',
    icon: Cpu,
    color: 'from-purple-500 to-pink-600',
  },
  {
    step: '03',
    title: 'Download Instantly',
    description: 'Your file is processed in seconds. Download immediately. Files auto-deleted after 10 minutes.',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Server-side processing completes in under 2 seconds on average for files up to 50MB.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Security',
    description: 'SSL encrypted transfers, isolated sandboxes per request, and 10-minute auto deletion.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: Globe,
    title: 'Works Everywhere',
    description: 'Browser-based previews powered by PDF.js. No plugins, no downloads, no installs.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: BrainCircuit,
    title: 'AI-Powered Tools',
    description: 'Summarize, rewrite, translate and generate content with built-in AI capabilities.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    icon: Users,
    title: 'No Registration',
    description: 'All tools are 100% free. No account, no email, no sign-up required — ever.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
  {
    icon: Award,
    title: '40+ Tools',
    description: 'Covering PDF, Word, PowerPoint, Excel, Images, and AI — all under one roof.',
    color: 'text-accent-primary',
    bg: 'bg-accent-primary/10',
  },
];

const FORMATS = [
  { name: 'PDF', icon: '📄', color: 'text-red-400' },
  { name: 'DOCX', icon: '📝', color: 'text-blue-400' },
  { name: 'PPTX', icon: '📊', color: 'text-orange-400' },
  { name: 'XLSX', icon: '📈', color: 'text-green-400' },
  { name: 'JPG', icon: '🖼️', color: 'text-teal-400' },
  { name: 'PNG', icon: '🖼️', color: 'text-cyan-400' },
  { name: 'WebP', icon: '🖼️', color: 'text-indigo-400' },
  { name: 'TXT', icon: '📃', color: 'text-slate-400' },
  { name: 'HTML', icon: '🌐', color: 'text-amber-400' },
  { name: 'CSV', icon: '📋', color: 'text-emerald-400' },
  { name: 'ZIP', icon: '🗜️', color: 'text-purple-400' },
  { name: 'SVG', icon: '✏️', color: 'text-pink-400' },
];

const TESTIMONIALS = [
  {
    quote: "DocMaster Pro saved our design team hours every week. The PDF merge and compress tools are absolutely flawless. I've tried everything else — this is the fastest.",
    name: 'Sarah K.',
    role: 'Creative Director',
    company: 'PixelFlow Studio',
    avatar: 'SK',
    rating: 5,
  },
  {
    quote: "The security model is exactly what our legal team needed. Files gone after 10 minutes, SSL, no registration. It just works. Clean, fast, trustworthy.",
    name: 'Marcus T.',
    role: 'Head of Legal Operations',
    company: 'Meridian Law Group',
    avatar: 'MT',
    rating: 5,
  },
  {
    quote: "I process 30+ PDFs daily for client reports. DocMaster's Merge and Compress tools cut my workflow time by 70%. The preview feature is a game changer.",
    name: 'Priya R.',
    role: 'Financial Analyst',
    company: 'Vertex Capital',
    avatar: 'PR',
    rating: 5,
  },
];

const FAQS = [
  {
    question: 'How does the file deletion policy work?',
    answer: 'All uploaded files and processed outputs are automatically and permanently deleted from our servers exactly 10 minutes after upload. You can also delete files manually at any time via the Download Center.',
  },
  {
    question: 'Is my data secure when using DocMaster Pro?',
    answer: 'Absolutely. Files are processed in isolated server sandboxes with no human access. All transfers use SSL/HTTPS encryption. No file contents are ever stored, cached, or logged beyond the 10-minute window.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No. All core tools are 100% free and require no registration. Simply upload, process, and download. Creating an account (coming soon) unlocks file history, favorites, and team features.',
  },
  {
    question: 'What is the maximum file size?',
    answer: 'Each file can be up to 50MB. For larger files, we recommend compressing them first using our Compress PDF or Compress PPT tools.',
  },
  {
    question: 'Can I preview files before processing?',
    answer: 'Yes! PDF Merge, Split, and Rotate tools include a live browser-based preview powered by PDF.js. You can inspect pages, order, and orientation before submitting.',
  },
  {
    question: 'Which document formats are supported?',
    answer: 'We support PDF, DOCX, PPTX, XLSX, JPG, PNG, WebP, TXT, HTML, CSV, and more. The full list grows as we launch new tools.',
  },
];

export default function Home() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const popularTools = getPopularTools();

  // Cycle headlines
  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex(i => (i + 1) % HEADLINES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* 3D Global Background */}
      <Hero3DBackground />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION                                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. CATEGORY EXPLORER                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 3. POPULAR TOOLS                                             */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 4. STATS SECTION                                             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-950/60 border-y border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-1">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{stat.value}</div>
                  <div className="text-slate-400 text-xs font-semibold">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 5. HOW IT WORKS                                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 6. PLATFORM FEATURES                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 7. SUPPORTED FORMATS                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 8. SECURITY & PRIVACY                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 9. TESTIMONIALS                                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-950/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label mb-4 inline-flex">
              <Star className="w-3.5 h-3.5" />
              Loved by users
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="rounded-2xl glass-panel p-6 flex flex-col gap-5"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-grow">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white text-xs font-extrabold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{t.name}</div>
                    <div className="text-slate-400 text-[11px]">{t.role} · {t.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 10. FAQ                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
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

    </div>
  );
}
