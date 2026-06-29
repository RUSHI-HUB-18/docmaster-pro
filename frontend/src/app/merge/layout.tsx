import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merge PDF | DocMaster Pro',
  description: 'Combine multiple PDFs into a single file.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
