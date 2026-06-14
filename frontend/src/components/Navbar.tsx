'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText, Search, Menu, X, ChevronDown,
  Sparkles, Shield, LayoutDashboard, LogIn, ArrowRight,
  Combine, Scissors, Minimize, RotateCw, Lock, Unlock,
  Image, FileImage, Code, Languages, Hash, RefreshCw,
  BrainCircuit, MessageCircle, Wrench, ScanLine, Stamp,
  PenLine, FileOutput, GripVertical, FilePlus, FileCheck,
  FileSpreadsheet, SpellCheck, AlignLeft, Presentation,
  Sheet, Table, Expand, MessageSquare, FileType, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORY_META, ALL_TOOLS, searchTools, type ToolCategory } from '@/lib/tools-data';

// Icon mapping from string → component
const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Search, Sparkles, Shield, Combine, Scissors, Minimize, RotateCw,
  Lock, Unlock, Image, FileImage, Code, Languages, Hash, RefreshCw,
  BrainCircuit, MessageCircle, Wrench, ScanLine, Stamp, PenLine, FileOutput,
  GripVertical, FilePlus, FileCheck, FileSpreadsheet, SpellCheck, AlignLeft,
  Presentation, Sheet, Table, Expand, MessageSquare, FileType, Layout,
  ImageIcon: Image,
};

// Grouped tools for each mega-menu
const MEGA_MENU: Record<ToolCategory, { group: string; tools: typeof ALL_TOOLS }[]> = {
  pdf: [
    { group: 'Convert', tools: ALL_TOOLS.filter(t => t.category === 'pdf' && t.group === 'Convert').slice(0, 4) },
    { group: 'Organize', tools: ALL_TOOLS.filter(t => t.category === 'pdf' && t.group === 'Organize') },
    { group: 'Optimize', tools: ALL_TOOLS.filter(t => t.category === 'pdf' && t.group === 'Optimize') },
    { group: 'Security', tools: ALL_TOOLS.filter(t => t.category === 'pdf' && t.group === 'Security') },
  ],
  word: [
    { group: 'Convert', tools: ALL_TOOLS.filter(t => t.category === 'word' && t.group === 'Convert') },
    { group: 'Edit', tools: ALL_TOOLS.filter(t => t.category === 'word' && t.group === 'Edit') },
    { group: 'AI', tools: ALL_TOOLS.filter(t => t.category === 'word' && t.group === 'AI') },
  ],
  powerpoint: [
    { group: 'Convert', tools: ALL_TOOLS.filter(t => t.category === 'powerpoint' && t.group === 'Convert') },
    { group: 'Edit', tools: ALL_TOOLS.filter(t => t.category === 'powerpoint' && t.group === 'Edit') },
    { group: 'AI', tools: ALL_TOOLS.filter(t => t.category === 'powerpoint' && t.group === 'AI') },
  ],
  excel: [
    { group: 'Convert', tools: ALL_TOOLS.filter(t => t.category === 'excel' && t.group === 'Convert') },
  ],
  images: [
    { group: 'Convert', tools: ALL_TOOLS.filter(t => t.category === 'images' && t.group === 'Convert') },
    { group: 'Edit', tools: ALL_TOOLS.filter(t => t.category === 'images' && t.group === 'Edit') },
    { group: 'Optimize', tools: ALL_TOOLS.filter(t => t.category === 'images' && t.group === 'Optimize') },
  ],
  'ai-tools': [
    { group: 'Analyze', tools: ALL_TOOLS.filter(t => t.category === 'ai-tools' && t.group === 'Analyze') },
    { group: 'Generate', tools: ALL_TOOLS.filter(t => t.category === 'ai-tools' && t.group === 'Generate') },
  ],
};

const BADGE_STYLES: Record<string, string> = {
  Popular: 'badge-popular',
  New: 'badge-new',
  AI: 'badge-ai',
  Pro: 'badge-pro',
};

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ToolCategory | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<ToolCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchResults = searchTools(searchQuery);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
    setActiveMenu(null);
    setSearchOpen(false);
    setSearchQuery('');
  }, [pathname]);

  const handleMenuEnter = (cat: ToolCategory) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(cat);
  };

  const handleMenuLeave = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const catMeta = (id: ToolCategory) => CATEGORY_META.find(c => c.id === id)!;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-border-color py-3'
          : 'bg-transparent py-4'
      }`}
    >
      {/* ── Main Bar ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-md shadow-accent-primary/20 group-hover:scale-105 transition-transform duration-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-[18px] tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                DocMaster<span className="text-accent-primary">.</span>
              </span>
              <span className="text-[9px] block font-bold uppercase tracking-widest text-accent-secondary">PRO</span>
            </div>
          </Link>

          {/* Desktop Nav — category tabs */}
          <nav className="hidden lg:flex items-center gap-0" ref={menuRef}>
            {CATEGORY_META.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || FileText;
              const isActive = activeMenu === cat.id || pathname.startsWith(cat.path);
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => handleMenuEnter(cat.id as ToolCategory)}
                  onMouseLeave={handleMenuLeave}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/8'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3 h-3 opacity-70 shrink-0" />
                  <span className="hidden xl:inline">{cat.name}</span>
                  <span className="xl:hidden">{cat.name.split(' ')[0]}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 shrink-0 ${
                      activeMenu === cat.id ? 'rotate-180 text-accent-primary' : 'opacity-50'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search — xl+ only */}
            <div className="relative hidden xl:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  className="w-40 input-premium py-1.5 pl-8 pr-4 text-xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <AnimatePresence>
                {searchOpen && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel p-2 shadow-2xl z-50 border border-white/8"
                  >
                    <div className="text-[10px] font-bold text-slate-400 px-3 py-1.5 border-b border-white/5 uppercase tracking-wider">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    <div className="mt-1 max-h-64 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        searchResults.map(tool => {
                          const TIcon = ICON_MAP[tool.icon] || FileText;
                          return (
                            <Link
                              key={tool.path}
                              href={tool.path}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent-primary/10 transition-colors group"
                            >
                              <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${tool.color} flex items-center justify-center shrink-0`}>
                                <TIcon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white group-hover:text-accent-primary transition-colors">{tool.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{tool.description}</div>
                              </div>
                              {!tool.isLive && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 shrink-0">Soon</span>
                              )}
                            </Link>
                          );
                        })
                      ) : (
                        <div className="text-sm text-slate-400 p-4 text-center">No tools found for "{searchQuery}"</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dashboard */}
            <Link
              href="/dashboard"
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden 2xl:inline">Dashboard</span>
            </Link>

            {/* Auth buttons */}
            <Link href="/auth" className="hidden xl:flex btn-ghost text-xs py-1.5 px-3 gap-1.5">
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </Link>
            <Link href="/auth" className="btn-primary text-xs py-1.5 px-4 hidden sm:flex gap-1.5 whitespace-nowrap">
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop Mega-Menu Dropdown ────────────────────────────────── */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="nav-mega-container mega-menu-panel hidden lg:block"
            onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
            onMouseLeave={handleMenuLeave}
          >
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="flex gap-8">
                {/* Category info panel */}
                <div className="w-52 shrink-0">
                  {(() => {
                    const meta = catMeta(activeMenu);
                    const Icon = ICON_MAP[meta.icon] || FileText;
                    return (
                      <div className="flex flex-col gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${meta.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-extrabold text-lg">{meta.name} Tools</h3>
                          <p className="text-slate-400 text-xs mt-1 leading-relaxed">{meta.shortDesc}</p>
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="text-accent-primary font-bold">{meta.toolCount}</span> tools available
                        </div>
                        <Link
                          href={meta.path}
                          className="mt-1 flex items-center gap-1.5 text-accent-primary text-xs font-bold hover:gap-2.5 transition-all"
                        >
                          View all {meta.name} tools <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })()}
                </div>

                {/* Divider */}
                <div className="w-px bg-white/5 shrink-0" />

                {/* Tool groups */}
                <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-6">
                  {MEGA_MENU[activeMenu]?.map(({ group, tools }) => (
                    <div key={group}>
                      <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">
                        {group}
                      </h4>
                      <ul className="flex flex-col gap-1">
                        {tools.map(tool => {
                          const TIcon = ICON_MAP[tool.icon] || FileText;
                          return (
                            <li key={tool.path}>
                              <Link
                                href={tool.path}
                                className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group"
                              >
                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${tool.color} flex items-center justify-center shrink-0 opacity-90 group-hover:opacity-100 transition-opacity`}>
                                  <TIcon className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[13px] font-semibold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                                    {tool.name}
                                    {tool.badge && (
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${BADGE_STYLES[tool.badge] || ''}`}>
                                        {tool.badge}
                                      </span>
                                    )}
                                    {!tool.isLive && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-white/5">Soon</span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Search Expand ──────────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-background/95 border-b border-border-color overflow-hidden"
          >
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search 40+ tools..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full input-premium py-2.5 pl-10 pr-4 text-sm"
                  autoFocus
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {searchQuery && (
                <div className="mt-2 glass-panel rounded-xl p-2 max-h-52 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(tool => (
                      <Link
                        key={tool.path}
                        href={tool.path}
                        className="block px-3 py-2 rounded-lg hover:bg-accent-primary/10 text-slate-300 hover:text-white"
                      >
                        <div className="text-sm font-semibold">{tool.name}</div>
                        <div className="text-xs text-slate-400">{tool.description}</div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 p-3 text-center">No tools found</div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Navigation Drawer ──────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/98 border-b border-border-color overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
              {CATEGORY_META.map(cat => {
                const Icon = ICON_MAP[cat.icon] || FileText;
                const isExpanded = mobileExpanded === cat.id;
                const groups = MEGA_MENU[cat.id as ToolCategory] || [];
                return (
                  <div key={cat.id} className="rounded-xl overflow-hidden border border-white/5">
                    <button
                      onClick={() => setMobileExpanded(isExpanded ? null : cat.id as ToolCategory)}
                      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${cat.color} flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white">{cat.name}</span>
                        <span className="text-[10px] text-slate-500">{cat.toolCount} tools</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden bg-black/20"
                        >
                          <div className="px-4 pb-3 pt-2 flex flex-col gap-3">
                            {groups.map(({ group, tools }) => (
                              <div key={group}>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{group}</div>
                                <div className="flex flex-col gap-1">
                                  {tools.map(tool => (
                                    <Link
                                      key={tool.path}
                                      href={tool.path}
                                      className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5"
                                    >
                                      <span className="text-sm text-slate-300">{tool.name}</span>
                                      {!tool.isLive && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-500">Soon</span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <Link
                              href={cat.path}
                              className="text-xs text-accent-primary font-bold flex items-center gap-1 pt-1"
                            >
                              View all {cat.name} tools <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Mobile auth buttons */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                <Link href="/auth" className="btn-ghost flex-1 text-sm py-2.5 justify-center">Sign In</Link>
                <Link href="/auth" className="btn-primary flex-1 text-sm py-2.5 justify-center">Get Started</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
