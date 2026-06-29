import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Protect PDF | DocMaster Pro',
  description: 'Add password protection to secure your PDF files.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
