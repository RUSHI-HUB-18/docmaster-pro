import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compress PowerPoint | DocMaster Pro',
  description: 'Reduce the file size of your PPTX presentations.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
