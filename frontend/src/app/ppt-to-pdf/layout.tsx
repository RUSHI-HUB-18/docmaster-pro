import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PowerPoint to PDF Converter | DocMaster Pro',
  description: 'Convert PPTX presentations to PDF format securely.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
