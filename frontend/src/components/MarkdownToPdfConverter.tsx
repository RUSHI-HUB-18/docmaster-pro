'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck,
  Download,
  RefreshCw,
  FileText,
  Clock,
  Eye,
  Type,
  Palette,
  ChevronRight
} from 'lucide-react';
import ConverterShell from '@/components/ConverterShell';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { formatSize } from '@/lib/utils';

// Emoji font fallback chain for cross-platform support
const EMOJI_FONTS = `'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;

// Google Fonts to load per theme
const GOOGLE_FONT_URLS: Record<string, string> = {
  classic: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Source+Code+Pro:wght@400;500&display=swap',
  modern: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fira+Code:wght@400;500&display=swap',
  minimal: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
};

type PdfTheme = 'classic' | 'modern' | 'minimal';

const THEMES: { id: PdfTheme; title: string; desc: string }[] = [
  { id: 'classic', title: 'Classic', desc: 'Traditional serif typography, warm tones' },
  { id: 'modern', title: 'Modern', desc: 'Clean sans-serif look, cool blue accents' },
  { id: 'minimal', title: 'Minimal', desc: 'Stripped-down, maximum whitespace' },
];

function getThemeCSS(theme: PdfTheme): string {
  const scope = '.markdown-preview-container';
  switch (theme) {
    case 'classic':
      return `
        ${scope} { font-family: 'Merriweather', 'Georgia', 'Times New Roman', serif, ${EMOJI_FONTS}; color: #1a1a1a; line-height: 1.8; max-width: 720px; margin: 0 auto; padding: 40px 24px; font-size: 15px; -webkit-font-smoothing: antialiased; }
        ${scope} h1, ${scope} h2, ${scope} h3, ${scope} h4, ${scope} h5, ${scope} h6 { font-family: 'Merriweather', 'Georgia', serif, ${EMOJI_FONTS}; }
        ${scope} h1 { font-size: 28px; border-bottom: 2px solid #8b5e3c; padding-bottom: 8px; margin-bottom: 20px; color: #3d2b1f; font-weight: 900; }
        ${scope} h2 { font-size: 22px; color: #5a3e28; margin-top: 28px; font-weight: 700; }
        ${scope} h3 { font-size: 18px; color: #6b4a2e; margin-top: 20px; font-weight: 700; }
        ${scope} p { margin: 10px 0; }
        ${scope} code { background: #f5f0e8; padding: 2px 6px; border-radius: 4px; font-size: 0.88em; font-family: 'Source Code Pro', 'Courier New', monospace; }
        ${scope} pre { background: #f5f0e8; padding: 16px; border-radius: 8px; overflow-x: auto; border-left: 4px solid #8b5e3c; }
        ${scope} pre code { background: none; padding: 0; }
        ${scope} blockquote { border-left: 4px solid #c4a87c; margin: 16px 0; padding: 12px 20px; background: #faf6f0; color: #5a4a3a; font-style: italic; border-radius: 0 8px 8px 0; }
        ${scope} table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        ${scope} th, ${scope} td { border: 1px solid #d4c4a8; padding: 10px 14px; text-align: left; }
        ${scope} th { background: #f5ede0; font-weight: 700; }
        ${scope} a { color: #8b5e3c; }
        ${scope} ul, ${scope} ol { padding-left: 24px; }
        ${scope} li { margin: 4px 0; }
        ${scope} hr { border: none; border-top: 1px solid #d4c4a8; margin: 24px 0; }
        ${scope} img { max-width: 100%; border-radius: 8px; }
        ${scope} strong { font-weight: 700; }
        ${scope} em { font-style: italic; }
      `;
    case 'modern':
      return `
        ${scope} { font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif, ${EMOJI_FONTS}; color: #1e293b; line-height: 1.75; max-width: 720px; margin: 0 auto; padding: 40px 24px; font-size: 15px; -webkit-font-smoothing: antialiased; }
        ${scope} h1, ${scope} h2, ${scope} h3, ${scope} h4, ${scope} h5, ${scope} h6 { font-family: 'Inter', 'Segoe UI', sans-serif, ${EMOJI_FONTS}; }
        ${scope} h1 { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; }
        ${scope} h2 { font-size: 22px; font-weight: 700; color: #334155; margin-top: 28px; }
        ${scope} h3 { font-size: 18px; font-weight: 600; color: #475569; margin-top: 20px; }
        ${scope} p { margin: 10px 0; color: #374151; }
        ${scope} code { background: #f1f5f9; padding: 2px 6px; border-radius: 6px; font-size: 0.86em; color: #6366f1; font-family: 'Fira Code', 'Consolas', monospace; }
        ${scope} pre { background: #0f172a; color: #e2e8f0; padding: 16px; border-radius: 12px; overflow-x: auto; }
        ${scope} pre code { background: none; padding: 0; color: #e2e8f0; }
        ${scope} blockquote { border-left: 4px solid #6366f1; margin: 16px 0; padding: 12px 20px; background: #f0f0ff; color: #4338ca; border-radius: 0 12px 12px 0; }
        ${scope} table { border-collapse: collapse; width: 100%; margin: 16px 0; border-radius: 12px; overflow: hidden; }
        ${scope} th, ${scope} td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; }
        ${scope} th { background: #f1f5f9; font-weight: 700; color: #334155; }
        ${scope} a { color: #3b82f6; text-decoration: none; }
        ${scope} a:hover { text-decoration: underline; }
        ${scope} ul, ${scope} ol { padding-left: 24px; }
        ${scope} li { margin: 4px 0; }
        ${scope} hr { border: none; border-top: 2px solid #e2e8f0; margin: 24px 0; }
        ${scope} img { max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        ${scope} strong { font-weight: 700; }
        ${scope} em { font-style: italic; }
      `;
    case 'minimal':
      return `
        ${scope} { font-family: 'DM Sans', 'Helvetica Neue', 'Arial', sans-serif, ${EMOJI_FONTS}; color: #111; line-height: 1.7; max-width: 680px; margin: 0 auto; padding: 48px 24px; font-size: 15px; -webkit-font-smoothing: antialiased; }
        ${scope} h1, ${scope} h2, ${scope} h3, ${scope} h4, ${scope} h5, ${scope} h6 { font-family: 'DM Sans', 'Helvetica Neue', sans-serif, ${EMOJI_FONTS}; }
        ${scope} h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 16px; }
        ${scope} h2 { font-size: 20px; font-weight: 600; margin-top: 32px; }
        ${scope} h3 { font-size: 16px; font-weight: 600; margin-top: 24px; }
        ${scope} p { margin: 8px 0; color: #333; }
        ${scope} code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
        ${scope} pre { background: #f4f4f4; padding: 14px; border-radius: 6px; overflow-x: auto; }
        ${scope} pre code { background: none; padding: 0; }
        ${scope} blockquote { border-left: 3px solid #ccc; margin: 14px 0; padding: 8px 16px; color: #555; }
        ${scope} table { border-collapse: collapse; width: 100%; margin: 14px 0; }
        ${scope} th, ${scope} td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
        ${scope} th { background: #f9f9f9; font-weight: 600; }
        ${scope} a { color: #111; }
        ${scope} ul, ${scope} ol { padding-left: 20px; }
        ${scope} li { margin: 3px 0; }
        ${scope} hr { border: none; border-top: 1px solid #eee; margin: 28px 0; }
        ${scope} img { max-width: 100%; }
        ${scope} strong { font-weight: 600; }
        ${scope} em { font-style: italic; }
      `;
  }
}

export default function MarkdownToPdfConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [markdownText, setMarkdownText] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [theme, setTheme] = useState<PdfTheme>('modern');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    downloadUrl: string;
    name: string;
    size: number;
  } | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  // Parse markdown whenever content or theme changes
  useEffect(() => {
    if (!markdownText) {
      setRenderedHtml('');
      return;
    }

    const parseMarkdown = async () => {
      try {
        const rawHtml = await marked.parse(markdownText, { gfm: true, breaks: true });
        const safeHtml = DOMPurify.sanitize(rawHtml, {
          FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
        });
        setRenderedHtml(safeHtml);
      } catch {
        setRenderedHtml('<p style="color:red;">Failed to parse Markdown content.</p>');
      }
    };
    parseMarkdown();
  }, [markdownText]);

  // Load Google Fonts when theme changes
  useEffect(() => {
    setFontsLoaded(false);
    const fontUrl = GOOGLE_FONT_URLS[theme];
    if (!fontUrl) return;

    // Remove any previous font link we added
    const prevLink = document.getElementById('md-theme-font');
    if (prevLink) prevLink.remove();

    const link = document.createElement('link');
    link.id = 'md-theme-font';
    link.rel = 'stylesheet';
    link.href = fontUrl;
    link.onload = () => setFontsLoaded(true);
    link.onerror = () => setFontsLoaded(true); // proceed anyway
    document.head.appendChild(link);

    return () => {
      const el = document.getElementById('md-theme-font');
      if (el) el.remove();
    };
  }, [theme]);

  const handleFilesSelected = async (selected: File[]) => {
    if (selected.length === 0) return;
    const selectedFile = selected[0];

    if (!selectedFile.name.endsWith('.md') && !selectedFile.name.endsWith('.markdown') && !selectedFile.name.endsWith('.txt')) {
      setError('Please upload a Markdown file (.md, .markdown) or plain text file (.txt).');
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      setMarkdownText(text);
    } catch {
      setError('Failed to read the file content.');
    }
  };

  const resetTool = () => {
    if (successResult?.downloadUrl) {
      URL.revokeObjectURL(successResult.downloadUrl);
    }
    setFile(null);
    setMarkdownText('');
    setRenderedHtml('');
    setProcessing(false);
    setProgress(0);
    setCurrentTask('');
    setError(null);
    setSuccessResult(null);
  };

  const handleConvertToPdf = async () => {
    if (!renderedHtml || !previewRef.current) return;

    setProcessing(true);
    setError(null);
    setProgress(10);
    setCurrentTask('Preparing document layout...');

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      setProgress(40);
      setCurrentTask('Applying theme styling...');

      const opt = {
        margin: [0.5, 0.6, 0.5, 0.6],
        filename: `${(file?.name || 'document').replace(/\.[^/.]+$/, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 3,            // Higher scale = sharper fonts & emoji
          useCORS: true,
          logging: false,
          letterRendering: true,
          allowTaint: false,
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const },
      };

      setProgress(70);
      setCurrentTask('Generating PDF pages...');

      const pdfBlob: Blob = await (html2pdf() as any).from(previewRef.current, 'element').set(opt as any).output('blob');
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const outputFilename = `${(file?.name || 'document').replace(/\.[^/.]+$/, '')}.pdf`;

      setProgress(100);
      setSuccessResult({
        downloadUrl,
        name: outputFilename,
        size: pdfBlob.size,
      });

      // Dispatch global history event
      const uploadId = 'md_pdf_' + Math.random().toString(36).substring(2, 11);
      const processedEvent = new CustomEvent('pdfmaster_add_processed_file', {
        detail: {
          id: uploadId,
          name: outputFilename,
          tool: 'Markdown to PDF',
          size: pdfBlob.size,
          downloadUrl: downloadUrl,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(processedEvent);

      setProcessing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate PDF. Please try again.');
      setProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (successResult?.downloadUrl) {
        URL.revokeObjectURL(successResult.downloadUrl);
      }
    };
  }, [successResult]);

  return (
    <ConverterShell
      files={file ? [file] : []}
      processing={processing}
      progress={progress}
      currentTask={currentTask || 'Converting Markdown to PDF...'}
      error={error}
      successResult={successResult as any}
      onReset={resetTool}
      accept=".md,.markdown,.txt"
      multiple={false}
      onFilesSelected={handleFilesSelected}
      actionButtonLabel="Convert to PDF"
      onAction={handleConvertToPdf}
      isActionDisabled={!renderedHtml}
      successComponent={
        successResult && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <FileCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">PDF Generated Successfully!</h3>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Your Markdown document has been beautifully formatted and compiled into a PDF. Download it below.
              </p>
            </div>

            {/* File Info Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/5 p-4 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-white text-xs font-bold truncate">{successResult.name}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  PDF Document · {formatSize(successResult.size)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full max-w-sm">
              <a
                href={successResult.downloadUrl}
                download={successResult.name}
                className="flex-grow py-3 px-5 rounded-xl font-bold bg-accent-primary hover:bg-accent-primary/95 text-white flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/10 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download PDF
              </a>
              <button
                onClick={resetTool}
                className="py-3 px-5 rounded-xl font-bold border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </motion.div>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Preview Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-purple-400" /> Live Preview
          </h3>

          {/* Rendered Markdown Preview */}
          <div className="border border-white/5 bg-white rounded-2xl p-6 sm:p-8 max-h-[600px] overflow-y-auto shadow-inner">
            <div
              ref={previewRef}
              className="markdown-preview-container"
            >
              <style>{getThemeCSS(theme)}</style>
              {renderedHtml ? (
                <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-12">
                  Upload a Markdown file to see the live preview here...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Settings Column */}
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-400" /> PDF Theme
            </h3>

            <div className="flex flex-col gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                    theme === t.id
                      ? 'bg-accent-primary/10 border-accent-primary/30 text-white'
                      : 'bg-white/2 border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${theme === t.id ? 'bg-accent-primary animate-pulse' : 'bg-slate-600'}`} />
                    {t.title}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-normal pl-3.5">
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* File Details */}
          {file && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white/2 border border-white/5 p-4 text-xs text-slate-400">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold">File Name</span>
                <span className="text-white truncate max-w-[150px] font-semibold">{file.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="font-bold">File Size</span>
                <span className="text-white font-semibold">{formatSize(file.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Characters</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Type className="w-3 h-3 text-purple-400" /> {markdownText.length.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Informational Badge */}
          <div className="mt-auto p-4 rounded-2xl border border-white/5 bg-white/2 text-slate-400 text-xs leading-relaxed flex flex-col gap-2">
            <div className="flex items-center gap-2 text-accent-primary font-bold">
              <Clock className="w-4 h-4" /> 100% Client-Side
            </div>
            <p className="text-[11px] text-slate-400">
              Your Markdown content is parsed, themed, and converted to PDF entirely in your browser. No data ever leaves your device.
            </p>
          </div>
        </div>
      </div>
    </ConverterShell>
  );
}
