'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield } from 'lucide-react';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 py-16">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Coming soon overlay */}
        <div className="absolute inset-0 rounded-3xl z-10 flex flex-col items-center justify-center gap-4 backdrop-blur-sm bg-background/60">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center shadow-xl">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="text-center px-6">
            <div className="text-accent-primary font-extrabold text-xs uppercase tracking-widest mb-2">Coming Soon</div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Accounts Launching Soon</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              User accounts with file history, favorites, and team features are in development.
              All tools are currently free without sign-in.
            </p>
          </div>
          <Link href="/pdf" className="btn-primary mt-2">
            Browse Free Tools <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-slate-500 text-xs">No account needed · 100% Free</p>
        </div>

        {/* Auth form (visible but blurred behind overlay) */}
        <div className="glass-panel rounded-3xl p-8 pointer-events-none select-none">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white">DocMaster<span className="text-accent-primary">.</span></span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  tab === t ? 'bg-accent-primary text-white' : 'text-slate-400'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* OAuth */}
          <div className="flex flex-col gap-2.5 mb-5">
            <button className="btn-ghost w-full py-2.5 gap-3 text-sm">
              <span className="text-base">G</span> Continue with Google
            </button>
            <button className="btn-ghost w-full py-2.5 gap-3 text-sm">
              <span className="text-base font-bold">GH</span> Continue with GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-slate-500 font-medium">or with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4">
            {tab === 'signup' && (
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full input-premium py-2.5 px-4 text-sm" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">Email Address</label>
              <div className="relative">
                <input type="email" placeholder="you@example.com" className="w-full input-premium py-2.5 pl-10 pr-4 text-sm" />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full input-premium py-2.5 pl-10 pr-10 text-sm" />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <button className="btn-primary w-full py-3 justify-center mt-1">
              {tab === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
            <span>SSL encrypted · No spam ever</span>
          </div>
        </div>
      </div>
    </div>
  );
}
