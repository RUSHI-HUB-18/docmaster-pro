import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rotate PDF | DocMaster Pro',
  description: 'Rotate pages in your PDF document easily.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
