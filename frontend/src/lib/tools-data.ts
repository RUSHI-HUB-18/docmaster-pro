// Central Tools Registry — Single source of truth for all platform tools
// Used by: Navbar mega-menu, Search, Homepage, Category pages, Related tools

export type ToolCategory = 'pdf' | 'word' | 'powerpoint' | 'excel' | 'images' | 'ai-tools';

export interface Tool {
  name: string;
  shortName?: string;
  description: string;
  path: string;
  category: ToolCategory;
  group: string;
  icon: string; // lucide icon name
  badge?: 'Popular' | 'New' | 'AI' | 'Pro';
  isLive: boolean;
  color: string; // tailwind gradient classes
  glow: string;  // rgba color for glow
}

export interface CategoryMeta {
  id: ToolCategory;
  name: string;
  shortDesc: string;
  icon: string;
  color: string;
  glow: string;
  toolCount: number;
  path: string;
}

// ─── PDF TOOLS ──────────────────────────────────────────────────────────────
const pdfTools: Tool[] = [
  // Convert
  {
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files',
    path: '/pdf-to-word',
    category: 'pdf',
    group: 'Convert',
    icon: 'FileText',
    badge: 'Popular',
    isLive: true,
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    name: 'PDF to PPT',
    description: 'Turn PDF slides into editable PowerPoint files',
    path: '/pdf-to-ppt',
    category: 'pdf',
    group: 'Convert',
    icon: 'PresentationChart',
    isLive: false,
    color: 'from-orange-500 to-amber-600',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    name: 'PDF to Excel',
    description: 'Extract tables from PDFs to spreadsheets',
    path: '/pdf-to-excel',
    category: 'pdf',
    group: 'Convert',
    icon: 'Sheet',
    isLive: false,
    color: 'from-green-500 to-emerald-600',
    glow: 'rgba(34,197,94,0.15)',
  },
  {
    name: 'PDF to JPG',
    description: 'Convert PDF pages to high-quality JPG images',
    path: '/pdf-to-jpg',
    category: 'pdf',
    group: 'Convert',
    icon: 'Image',
    isLive: true,
    color: 'from-teal-500 to-cyan-600',
    glow: 'rgba(20,184,166,0.15)',
  },
  {
    name: 'PDF to PNG',
    description: 'Export PDF pages as lossless PNG images',
    path: '/pdf-to-png',
    category: 'pdf',
    group: 'Convert',
    icon: 'ImageIcon',
    isLive: false,
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.15)',
  },
  // Create — note: these tools live in their own categories; listed here for PDF nav context
  {
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    path: '/word-to-pdf',
    category: 'pdf',
    group: 'Create',
    icon: 'FilePlus',
    badge: 'Popular',
    isLive: true,
    color: 'from-indigo-500 to-blue-600',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    name: 'PPT to PDF',
    description: 'Convert PowerPoint presentations to PDF',
    path: '/ppt-to-pdf',
    category: 'pdf',
    group: 'Create',
    icon: 'FileCheck',
    isLive: false,
    color: 'from-orange-500 to-red-600',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    name: 'Excel to PDF',
    description: 'Export Excel spreadsheets as PDF documents',
    path: '/excel-to-pdf',
    category: 'pdf',
    group: 'Create',
    icon: 'FileSpreadsheet',
    isLive: false,
    color: 'from-green-500 to-teal-600',
    glow: 'rgba(34,197,94,0.15)',
  },
  {
    name: 'Image to PDF',
    description: 'Combine images into a single PDF file',
    path: '/image-to-pdf',
    category: 'pdf',
    group: 'Create',
    icon: 'Images',
    isLive: false,
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.15)',
  },
  // Organize
  {
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    path: '/merge',
    category: 'pdf',
    group: 'Organize',
    icon: 'Combine',
    badge: 'Popular',
    isLive: true,
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59,130,246,0.15)',
  },
  {
    name: 'Split PDF',
    description: 'Split a PDF into individual pages or ranges',
    path: '/split',
    category: 'pdf',
    group: 'Organize',
    icon: 'Scissors',
    isLive: true,
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.15)',
  },
  {
    name: 'Rotate PDF',
    description: 'Rotate individual or all pages in a PDF',
    path: '/rotate',
    category: 'pdf',
    group: 'Organize',
    icon: 'RotateCw',
    isLive: true,
    color: 'from-purple-500 to-violet-600',
    glow: 'rgba(168,85,247,0.15)',
  },
  {
    name: 'Extract Pages',
    description: 'Extract specific pages from a PDF document',
    path: '/extract-pages',
    category: 'pdf',
    group: 'Organize',
    icon: 'FileOutput',
    isLive: false,
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    name: 'Rearrange Pages',
    description: 'Drag and drop to reorder PDF pages',
    path: '/rearrange-pages',
    category: 'pdf',
    group: 'Organize',
    icon: 'GripVertical',
    isLive: false,
    color: 'from-slate-500 to-slate-600',
    glow: 'rgba(100,116,139,0.15)',
  },
  // Optimize
  {
    name: 'Compress PDF',
    description: 'Reduce PDF file size without losing quality',
    path: '/compress',
    category: 'pdf',
    group: 'Optimize',
    icon: 'Minimize',
    badge: 'Popular',
    isLive: true,
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    name: 'Repair PDF',
    description: 'Fix corrupted or damaged PDF files',
    path: '/repair-pdf',
    category: 'pdf',
    group: 'Optimize',
    icon: 'Wrench',
    isLive: false,
    color: 'from-yellow-500 to-amber-600',
    glow: 'rgba(234,179,8,0.15)',
  },
  {
    name: 'OCR PDF',
    description: 'Make scanned PDFs searchable with OCR',
    path: '/ocr-pdf',
    category: 'pdf',
    group: 'Optimize',
    icon: 'ScanLine',
    badge: 'AI',
    isLive: false,
    color: 'from-violet-500 to-indigo-600',
    glow: 'rgba(139,92,246,0.15)',
  },
  // Security
  {
    name: 'Protect PDF',
    description: 'Add password protection to your PDF',
    path: '/protect-pdf',
    category: 'pdf',
    group: 'Security',
    icon: 'Lock',
    isLive: true,
    color: 'from-red-500 to-rose-600',
    glow: 'rgba(239,68,68,0.15)',
  },
  {
    name: 'Unlock PDF',
    description: 'Remove password from a PDF file',
    path: '/unlock-pdf',
    category: 'pdf',
    group: 'Security',
    icon: 'Unlock',
    isLive: false,
    color: 'from-emerald-500 to-green-600',
    glow: 'rgba(16,185,129,0.15)',
  },
  {
    name: 'Watermark PDF',
    description: 'Add text or image watermarks to PDFs',
    path: '/watermark-pdf',
    category: 'pdf',
    group: 'Security',
    icon: 'Stamp',
    isLive: false,
    color: 'from-blue-500 to-cyan-600',
    glow: 'rgba(59,130,246,0.15)',
  },
  {
    name: 'Sign PDF',
    description: 'Electronically sign PDF documents',
    path: '/sign-pdf',
    category: 'pdf',
    group: 'Security',
    icon: 'PenLine',
    badge: 'New',
    isLive: false,
    color: 'from-indigo-500 to-purple-600',
    glow: 'rgba(99,102,241,0.15)',
  },
];

// ─── WORD TOOLS ──────────────────────────────────────────────────────────────
const wordTools: Tool[] = [
  {
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    path: '/word-to-pdf',
    category: 'word',
    group: 'Convert',
    icon: 'FilePlus',
    badge: 'Popular',
    isLive: true,
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59,130,246,0.15)',
  },
  {
    name: 'Word to PPT',
    description: 'Transform Word content into presentations',
    path: '/word-to-ppt',
    category: 'word',
    group: 'Convert',
    icon: 'Layout',
    isLive: false,
    color: 'from-orange-500 to-amber-600',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    name: 'Word to HTML',
    description: 'Export Word documents as clean HTML',
    path: '/word-to-html',
    category: 'word',
    group: 'Convert',
    icon: 'Code',
    isLive: false,
    color: 'from-green-500 to-teal-600',
    glow: 'rgba(34,197,94,0.15)',
  },
  {
    name: 'Word to TXT',
    description: 'Extract plain text from Word documents',
    path: '/word-to-txt',
    category: 'word',
    group: 'Convert',
    icon: 'AlignLeft',
    isLive: false,
    color: 'from-slate-500 to-slate-600',
    glow: 'rgba(100,116,139,0.15)',
  },
  {
    name: 'Grammar Check',
    description: 'Check and fix grammar in your documents',
    path: '/grammar-check',
    category: 'word',
    group: 'Edit',
    icon: 'SpellCheck',
    badge: 'AI',
    isLive: false,
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    name: 'Word Counter',
    description: 'Count words, characters, and sentences',
    path: '/word-counter',
    category: 'word',
    group: 'Edit',
    icon: 'Hash',
    isLive: false,
    color: 'from-teal-500 to-cyan-600',
    glow: 'rgba(20,184,166,0.15)',
  },
  {
    name: 'Summarizer',
    description: 'Generate concise AI summaries of documents',
    path: '/summarizer',
    category: 'word',
    group: 'AI',
    icon: 'Sparkles',
    badge: 'AI',
    isLive: false,
    color: 'from-purple-500 to-violet-600',
    glow: 'rgba(168,85,247,0.15)',
  },
  {
    name: 'Rewrite Text',
    description: 'AI-powered text rewriting and paraphrasing',
    path: '/rewrite-text',
    category: 'word',
    group: 'AI',
    icon: 'RefreshCw',
    badge: 'AI',
    isLive: false,
    color: 'from-indigo-500 to-blue-600',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    name: 'Translate Document',
    description: 'Translate documents to 50+ languages',
    path: '/translate-document',
    category: 'word',
    group: 'AI',
    icon: 'Languages',
    badge: 'AI',
    isLive: false,
    color: 'from-blue-500 to-cyan-600',
    glow: 'rgba(59,130,246,0.15)',
  },
];

// ─── POWERPOINT TOOLS ────────────────────────────────────────────────────────
const powerpointTools: Tool[] = [
  {
    name: 'PPT to PDF',
    description: 'Convert presentations to PDF format',
    path: '/ppt-to-pdf',
    category: 'powerpoint',
    group: 'Convert',
    icon: 'FileCheck',
    badge: 'Popular',
    isLive: false,
    color: 'from-orange-500 to-red-600',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    name: 'PPT to Images',
    description: 'Export slides as individual images',
    path: '/ppt-to-images',
    category: 'powerpoint',
    group: 'Convert',
    icon: 'Image',
    isLive: false,
    color: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    name: 'Compress PPT',
    description: 'Reduce PowerPoint file size efficiently',
    path: '/compress-ppt',
    category: 'powerpoint',
    group: 'Edit',
    icon: 'Minimize',
    isLive: false,
    color: 'from-rose-500 to-pink-600',
    glow: 'rgba(244,63,94,0.15)',
  },
  {
    name: 'Merge PPT',
    description: 'Combine multiple presentations into one',
    path: '/merge-ppt',
    category: 'powerpoint',
    group: 'Edit',
    icon: 'Combine',
    isLive: false,
    color: 'from-orange-500 to-amber-600',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    name: 'Generate Presentation',
    description: 'Create slides with AI from a topic or outline',
    path: '/generate-presentation',
    category: 'powerpoint',
    group: 'AI',
    icon: 'Sparkles',
    badge: 'AI',
    isLive: false,
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    name: 'Speaker Notes Generator',
    description: 'Generate AI speaker notes for each slide',
    path: '/speaker-notes',
    category: 'powerpoint',
    group: 'AI',
    icon: 'MessageSquare',
    badge: 'AI',
    isLive: false,
    color: 'from-indigo-500 to-blue-600',
    glow: 'rgba(99,102,241,0.15)',
  },
];

// ─── EXCEL TOOLS ─────────────────────────────────────────────────────────────
const excelTools: Tool[] = [
  {
    name: 'Excel to PDF',
    description: 'Convert spreadsheets to PDF documents',
    path: '/excel-to-pdf',
    category: 'excel',
    group: 'Convert',
    icon: 'FileSpreadsheet',
    badge: 'Popular',
    isLive: false,
    color: 'from-green-500 to-emerald-600',
    glow: 'rgba(34,197,94,0.15)',
  },
  {
    name: 'Excel to CSV',
    description: 'Export Excel data as CSV files',
    path: '/excel-to-csv',
    category: 'excel',
    group: 'Convert',
    icon: 'Table',
    isLive: false,
    color: 'from-teal-500 to-green-600',
    glow: 'rgba(20,184,166,0.15)',
  },
];

// ─── IMAGE TOOLS ─────────────────────────────────────────────────────────────
const imageTools: Tool[] = [
  {
    name: 'Image to PDF',
    description: 'Combine images into PDF documents',
    path: '/image-to-pdf-img',
    category: 'images',
    group: 'Convert',
    icon: 'FileImage',
    badge: 'Popular',
    isLive: false,
    color: 'from-teal-500 to-cyan-600',
    glow: 'rgba(20,184,166,0.15)',
  },
  {
    name: 'Compress Image',
    description: 'Reduce image size without losing quality',
    path: '/compress-image',
    category: 'images',
    group: 'Optimize',
    icon: 'Minimize',
    isLive: false,
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.15)',
  },
  {
    name: 'Resize Image',
    description: 'Resize images to exact dimensions',
    path: '/resize-image',
    category: 'images',
    group: 'Edit',
    icon: 'Expand',
    isLive: false,
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59,130,246,0.15)',
  },
  {
    name: 'Convert Image',
    description: 'Convert between JPG, PNG, WebP, AVIF formats',
    path: '/convert-image',
    category: 'images',
    group: 'Convert',
    icon: 'RefreshCw',
    isLive: false,
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.15)',
  },
];

// ─── AI TOOLS ────────────────────────────────────────────────────────────────
const aiTools: Tool[] = [
  {
    name: 'AI Summarizer',
    description: 'Generate concise summaries of any document',
    path: '/ai-summarizer',
    category: 'ai-tools',
    group: 'Analyze',
    icon: 'BrainCircuit',
    badge: 'AI',
    isLive: false,
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    name: 'AI Chat with PDF',
    description: 'Ask questions about any PDF document',
    path: '/chat-pdf',
    category: 'ai-tools',
    group: 'Analyze',
    icon: 'MessageCircle',
    badge: 'AI',
    isLive: false,
    color: 'from-indigo-500 to-violet-600',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    name: 'AI Translator',
    description: 'Translate documents with AI accuracy',
    path: '/ai-translator',
    category: 'ai-tools',
    group: 'Generate',
    icon: 'Languages',
    badge: 'AI',
    isLive: false,
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59,130,246,0.15)',
  },
  {
    name: 'AI Writer',
    description: 'Generate professional document content with AI',
    path: '/ai-writer',
    category: 'ai-tools',
    group: 'Generate',
    icon: 'Sparkles',
    badge: 'AI',
    isLive: false,
    color: 'from-purple-500 to-pink-600',
    glow: 'rgba(168,85,247,0.15)',
  },
];

// ─── MASTER EXPORT ───────────────────────────────────────────────────────────
// Deduplicate by path — PDF category entries take precedence, others are cross-category references
const _allToolsRaw: Tool[] = [
  ...pdfTools,
  ...wordTools,
  ...powerpointTools,
  ...excelTools,
  ...imageTools,
  ...aiTools,
];

export const ALL_TOOLS: Tool[] = _allToolsRaw.reduce<Tool[]>((acc, tool) => {
  if (!acc.find(t => t.path === tool.path)) acc.push(tool);
  return acc;
}, []);

export const CATEGORY_META: CategoryMeta[] = [
  {
    id: 'pdf',
    name: 'PDF',
    shortDesc: 'Convert, merge, split, compress & secure PDF files',
    icon: 'FileText',
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(99,102,241,0.15)',
    toolCount: pdfTools.length,
    path: '/pdf',
  },
  {
    id: 'word',
    name: 'Word',
    shortDesc: 'Convert, edit, and AI-enhance Word documents',
    icon: 'FileType',
    color: 'from-sky-500 to-blue-600',
    glow: 'rgba(14,165,233,0.15)',
    toolCount: wordTools.length,
    path: '/word',
  },
  {
    id: 'powerpoint',
    name: 'PowerPoint',
    shortDesc: 'Create, convert and design presentations',
    icon: 'Presentation',
    color: 'from-orange-500 to-red-600',
    glow: 'rgba(249,115,22,0.15)',
    toolCount: powerpointTools.length,
    path: '/powerpoint',
  },
  {
    id: 'excel',
    name: 'Excel',
    shortDesc: 'Manage and convert spreadsheet files',
    icon: 'Sheet',
    color: 'from-green-500 to-emerald-600',
    glow: 'rgba(34,197,94,0.15)',
    toolCount: excelTools.length,
    path: '/excel',
  },
  {
    id: 'images',
    name: 'Images',
    shortDesc: 'Compress, resize, and convert image files',
    icon: 'Image',
    color: 'from-teal-500 to-cyan-600',
    glow: 'rgba(20,184,166,0.15)',
    toolCount: imageTools.length,
    path: '/images',
  },
  {
    id: 'ai-tools',
    name: 'AI Tools',
    shortDesc: 'AI-powered tools to analyze and generate content',
    icon: 'Sparkles',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.15)',
    toolCount: aiTools.length,
    path: '/ai-tools',
  },
];

export const getToolsByCategory = (category: ToolCategory) =>
  ALL_TOOLS.filter((t) => t.category === category);

export const getToolsByGroup = (category: ToolCategory, group: string) =>
  ALL_TOOLS.filter((t) => t.category === category && t.group === group);

export const getGroupsByCategory = (category: ToolCategory): string[] => [
  ...new Set(ALL_TOOLS.filter((t) => t.category === category).map((t) => t.group)),
];

export const searchTools = (query: string): Tool[] => {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return ALL_TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.group.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
  );
};

export const getPopularTools = (): Tool[] =>
  ALL_TOOLS.filter((t) => t.badge === 'Popular' || t.isLive).slice(0, 8);

export const getRelatedTools = (currentPath: string, limit = 4): Tool[] =>
  ALL_TOOLS.filter((t) => t.path !== currentPath).slice(0, limit);
