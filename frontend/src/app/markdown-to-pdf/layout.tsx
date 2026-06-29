import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markdown to PDF Converter | DocMaster Pro',
  description: 'Convert Markdown (.md) files to beautifully styled PDF documents with live preview. Choose from Classic, Modern, or Minimal themes.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
