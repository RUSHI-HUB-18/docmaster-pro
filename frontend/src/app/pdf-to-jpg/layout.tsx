import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to JPG Converter | DocMaster Pro',
  description: 'Convert PDF pages to high-quality JPG images.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
