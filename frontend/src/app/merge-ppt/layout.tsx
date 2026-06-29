import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merge PowerPoint | DocMaster Pro',
  description: 'Combine multiple PPTX files into one presentation.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
