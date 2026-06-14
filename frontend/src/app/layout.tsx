import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DownloadCenter from "@/components/DownloadCenter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocMaster Pro — PDF, Word, PPT & Image Tools | Free Online Document Platform",
  description: "Convert, merge, split, compress, rotate, and AI-process PDF, Word, PowerPoint, Excel, and image files. 40+ professional document tools. No sign-up. 100% free.",
  keywords: ["pdf tools", "word to pdf", "pdf to word", "merge pdf", "split pdf", "compress pdf", "rotate pdf", "document converter", "ai document tools", "online pdf editor"],
  openGraph: {
    title: "DocMaster Pro — All Your Document Tools in One Place",
    description: "40+ tools for PDF, Word, PowerPoint, Excel, Images, and AI. Free, fast, secure. No registration required.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <DownloadCenter />
        <Footer />
      </body>
    </html>
  );
}
