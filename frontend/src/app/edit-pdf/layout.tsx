import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit PDF Text Online | DocMaster Pro',
  description: 'Click on any text in your PDF to edit it directly. Font size and style automatically match the original document. 100% client-side, no uploads.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
