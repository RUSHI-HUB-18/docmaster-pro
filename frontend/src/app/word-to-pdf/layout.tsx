import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Word to PDF Converter | DocMaster Pro',
  description: 'Convert Microsoft Word documents (.docx) to PDF format instantly.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
