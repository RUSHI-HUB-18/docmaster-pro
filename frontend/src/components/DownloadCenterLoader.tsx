'use client';

import dynamic from 'next/dynamic';

const DownloadCenter = dynamic(() => import('./DownloadCenter'), {
  ssr: false,
});

export default function DownloadCenterLoader() {
  return <DownloadCenter />;
}
