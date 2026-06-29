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
import HeroSection from '@/components/home/HeroSection';
import CategoryExplorer from '@/components/home/CategoryExplorer';
import PopularTools from '@/components/home/PopularTools';
import HowItWorks from '@/components/home/HowItWorks';
import Features from '@/components/home/Features';
import SupportedFormats from '@/components/home/SupportedFormats';
import SecurityPrivacy from '@/components/home/SecurityPrivacy';
import Faq from '@/components/home/Faq';
import FinalCta from '@/components/home/FinalCta';



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
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION                                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <HeroSection headlineIndex={headlineIndex} HEADLINES={HEADLINES} />
{/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. CATEGORY EXPLORER                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <CategoryExplorer  />
{/* ══════════════════════════════════════════════════════════════ */}
      {/* 3. POPULAR TOOLS                                             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <PopularTools popularTools={popularTools} />
{/* ══════════════════════════════════════════════════════════════ */}
      {/* 5. HOW IT WORKS                                              */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <HowItWorks HOW_IT_WORKS={HOW_IT_WORKS} />
{/* ══════════════════════════════════════════════════════════════ */}
      {/* 6. PLATFORM FEATURES                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Features FEATURES={FEATURES} />
{/* ══════════════════════════════════════════════════════════════ */}
      {/* 7. SUPPORTED FORMATS                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <SupportedFormats FORMATS={FORMATS} />
{/* ══════════════════════════════════════════════════════════════ */}
      {/* 8. SECURITY & PRIVACY                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <SecurityPrivacy  />
{/* ══════════════════════════════════════════════════════════════ */}
      {/* 10. FAQ                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Faq FAQS={FAQS} openFaq={openFaq} setOpenFaq={setOpenFaq} />
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <FinalCta  />
    </div>
  );
}
