import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unlock PDF | DocMaster Pro',
  description: 'Remove passwords and restrictions from PDF files.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
