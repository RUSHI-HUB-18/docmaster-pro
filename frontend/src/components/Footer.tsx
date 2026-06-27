'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Shield, Sparkles, Heart, Mail, ArrowRight, Zap } from 'lucide-react';

const FOOTER_LINKS = {
  'PDF Tools': [
    { name: 'Merge PDF', href: '/merge' },
    { name: 'Split PDF', href: '/split' },
    { name: 'Compress PDF', href: '/compress' },
    { name: 'Rotate PDF', href: '/rotate' },
    { name: 'PDF to Word', href: '/pdf-to-word' },
    { name: 'Protect PDF', href: '/protect-pdf' },
  ],
  'Word & PPT': [
    { name: 'Word to PDF', href: '/word-to-pdf' },
    { name: 'PPT to PDF', href: '/ppt-to-pdf' },
    { name: 'Compress PPT', href: '/compress-ppt' },
    { name: 'AI Summarizer', href: '/ai-summarizer' },
    { name: 'Translate Doc', href: '/translate-document' },
  ],
  'Platform': [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'All PDF Tools', href: '/pdf' },
    { name: 'All Word Tools', href: '/word' },
    { name: 'AI Tools', href: '/ai-tools' },
    { name: 'Sign In', href: '/auth' },
    { name: 'Get Started', href: '/auth' },
  ],
  'Company': [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Security', href: '#security' },
    { name: 'Contact', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 mt-auto">
      {/* CTA Banner */}
      <div className="border-b border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-accent-primary/10 via-purple-600/10 to-accent-secondary/10 border border-accent-primary/15 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Zap className="w-4 h-4 text-accent-primary" />
                <span className="text-xs font-extrabold text-accent-primary uppercase tracking-widest">Start for free</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">All document tools, zero sign-up required.</h3>
              <p className="text-slate-400 text-sm">Process files instantly. Files deleted after 10 minutes.</p>
            </div>
            <Link
              href="/pdf"
              className="btn-primary shrink-0 whitespace-nowrap"
            >
              Browse All Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 xl:gap-12">

            {/* Brand Column — spans 2 */}
            <div className="col-span-2 flex flex-col gap-5">
              <Link href="/" className="flex items-center gap-2.5 group self-start">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    DocMaster<span className="text-accent-primary">.</span>
                  </span>
                  <span className="text-[9px] block font-bold uppercase tracking-widest text-accent-secondary">PRO</span>
                </div>
              </Link>

              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                The professional document platform for converting, editing, and managing PDF, Word, PPT, and more — free and instant.
              </p>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>All files auto-deleted after 10 minutes</span>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-2 mt-1">
                {[
                  { label: 'X (Twitter)', href: '#', text: '𝕏' },
                  { label: 'GitHub', href: '#', text: 'GH' },
                  { label: 'LinkedIn', href: '#', text: 'in' },
                  { label: 'Email', href: '#', icon: true },
                ].map(({ label, href, text, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-accent-primary/15 hover:border-accent-primary/25 transition-all text-xs font-bold"
                  >
                    {icon ? <Mail className="w-3.5 h-3.5" /> : text}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4">{title}</h4>
                <ul className="flex flex-col gap-2.5">
                  {links.map(link => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white text-sm transition-colors hover:translate-x-0.5 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} DocMaster Pro. All rights reserved.
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Shield className="w-3 h-3 text-emerald-500/60" />
              SSL Encrypted
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Sparkles className="w-3 h-3 text-accent-primary/60" />
              No Registration
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Heart className="w-3 h-3 text-pink-500/60 fill-pink-500/60" />
              100% Free
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
