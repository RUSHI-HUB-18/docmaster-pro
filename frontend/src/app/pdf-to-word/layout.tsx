import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to Word Converter | DocMaster Pro',
  description: 'Convert PDF files to editable Word documents (.docx).',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
