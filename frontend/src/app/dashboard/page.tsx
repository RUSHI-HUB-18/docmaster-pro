'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, Star, Settings, Clock, Download,
  Trash2, Zap, TrendingDown, CheckCircle, ArrowRight, Sparkles,
  Combine, Scissors, Minimize, RotateCw
} from 'lucide-react';
import type { ProcessedFile } from '@/components/DownloadCenter';
import { API_URL } from '@/lib/config';

const FAVORITE_TOOLS = [
  { name: 'Merge PDF', path: '/merge', icon: Combine, color: 'from-blue-500 to-indigo-600' },
  { name: 'Split PDF', path: '/split', icon: Scissors, color: 'from-pink-500 to-rose-600' },
  { name: 'Compress PDF', path: '/compress', icon: Minimize, color: 'from-amber-500 to-orange-600' },
  { name: 'Rotate PDF', path: '/rotate', icon: RotateCw, color: 'from-purple-500 to-violet-600' },
];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'history', label: 'Recent Files', icon: FileText },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [history, setHistory] = useState<ProcessedFile[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('pdfmaster_processed_files');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ProcessedFile[];
        const active = parsed.filter(f => Date.now() - f.timestamp < 60 * 60 * 1000);
        setHistory(active);
      } catch {}
    }
  }, []);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <span className="text-xs font-bold text-accent-primary uppercase tracking-wider">Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Track your document processing history and quick-access your favorite tools.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-52 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1.5">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === id
                      ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Files Processed', value: history.length.toString(), icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Active Files', value: history.length.toString(), icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Tools Used', value: [...new Set(history.map(h => h.tool))].length.toString(), icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                    { label: 'Space Saved', value: history.length > 0 ? '~62%' : '—', icon: TrendingDown, color: 'text-pink-400', bg: 'bg-pink-400/10' },
                  ].map(stat => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="glass-panel rounded-xl p-4 flex flex-col gap-2">
                        <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                        <div className="text-slate-400 text-xs">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick tools */}
                <div>
                  <h2 className="text-lg font-extrabold text-white mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {FAVORITE_TOOLS.map(({ name, path, icon: Icon, color }) => (
                      <Link key={path} href={path} className="group">
                        <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 glass-panel-hover">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-white font-bold text-sm group-hover:text-accent-primary transition-colors">{name}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-extrabold text-white">Recent Activity</h2>
                    <button onClick={() => setActiveTab('history')} className="text-xs text-accent-primary font-bold flex items-center gap-1 hover:gap-1.5 transition-all">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {history.length === 0 ? (
                    <div className="glass-panel rounded-xl p-8 text-center flex flex-col items-center gap-3">
                      <FileText className="w-10 h-10 text-slate-600" />
                      <div className="text-white font-bold">No files processed yet</div>
                      <p className="text-slate-400 text-sm max-w-xs">Use any PDF tool to process a file — it'll appear here.</p>
                      <Link href="/pdf" className="btn-primary text-sm py-2 px-5 mt-1">
                        Start Processing
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {history.slice(0, 5).map(file => (
                        <div key={`${file.id}-${file.name}`} className="glass-panel rounded-xl p-4 flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center">
                            <FileText className="w-4.5 h-4.5 text-accent-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-bold text-sm truncate">{file.name}</div>
                            <div className="text-slate-400 text-xs flex items-center gap-2">
                              <span className="text-accent-primary font-semibold">{file.tool}</span>
                              <span>·</span>
                              <span>{formatSize(file.size)}</span>
                              <span>·</span>
                              <span>{timeAgo(file.timestamp)}</span>
                            </div>
                          </div>
                          <a
                            href={`${API_URL}${file.downloadUrl}`}
                            className="w-8 h-8 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 flex items-center justify-center text-accent-primary transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-white">Recent Files</h2>
                  {history.length > 0 && (
                    <span className="text-xs text-slate-400">{history.length} file{history.length !== 1 ? 's' : ''} active</span>
                  )}
                </div>
                {history.length === 0 ? (
                  <div className="glass-panel rounded-xl p-12 text-center flex flex-col items-center gap-3">
                    <Clock className="w-10 h-10 text-slate-600" />
                    <div className="text-white font-bold">No conversion history</div>
                    <p className="text-slate-400 text-sm">Process a file with any tool to see it here.</p>
                    <Link href="/pdf" className="btn-primary text-sm py-2 px-5 mt-2">Browse PDF Tools</Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {history.map(file => {
                      const timeLeft = Math.ceil((60 * 60 * 1000 - (Date.now() - file.timestamp)) / 60000);
                      return (
                        <div key={`${file.id}-${file.name}`} className="glass-panel rounded-xl p-5 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-accent-primary/10 border border-accent-primary/15 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-accent-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-bold text-sm truncate">{file.name}</div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[11px] text-accent-primary font-bold">{file.tool}</span>
                              <span className="text-[11px] text-slate-400">{formatSize(file.size)}</span>
                              {timeLeft > 0 ? (
                                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {timeLeft}m left
                                </span>
                              ) : (
                                <span className="text-[11px] text-red-400">Expired</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={`${API_URL}${file.downloadUrl}`}
                              className="w-8 h-8 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 flex items-center justify-center text-accent-primary transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* FAVORITES TAB */}
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-xl font-extrabold text-white mb-6">Favorite Tools</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {FAVORITE_TOOLS.map(({ name, path, icon: Icon, color }) => (
                    <Link key={path} href={path} className="group">
                      <div className="glass-panel rounded-xl p-5 flex flex-col gap-3 glass-panel-hover h-full">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${color} flex items-center justify-center`}>
                          <Icon className="w-5.5 h-5.5 text-white" />
                        </div>
                        <div className="font-bold text-white text-sm group-hover:text-accent-primary transition-colors">{name}</div>
                        <div className="text-accent-primary text-xs font-bold flex items-center gap-1 mt-auto group-hover:translate-x-0.5 transition-transform">
                          Open <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-8 glass-panel rounded-xl p-6 border border-dashed border-white/10 text-center">
                  <Star className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Pinned favorites coming with accounts. <Link href="/auth" className="text-accent-primary font-bold">Sign up</Link> to save your workspace.</p>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-extrabold text-white mb-6">Settings</h2>
                <div className="glass-panel rounded-xl p-8 flex flex-col items-center text-center gap-4">
                  <Settings className="w-10 h-10 text-slate-600" />
                  <div className="text-white font-bold">Account Settings Coming Soon</div>
                  <p className="text-slate-400 text-sm max-w-xs">
                    Create a free account to save preferences, manage file history, and access team features.
                  </p>
                  <Link href="/auth" className="btn-primary text-sm py-2 px-6 mt-1">
                    Create Free Account
                  </Link>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
