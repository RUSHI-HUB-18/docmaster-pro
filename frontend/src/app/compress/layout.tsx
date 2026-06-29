import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compress PDF | DocMaster Pro',
  description: 'Reduce the file size of your PDF documents.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
