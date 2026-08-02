import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import localFont from 'next/font/local';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/AuthContext';

import './globals.css';

const localChineseFont = localFont({
  src: [
    {
      path: '../public/fonts/SourceHanSansSC-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/SourceHanSansSC-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-local-chinese',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '墨同文档',
  description:
    '墨同文档 是一个基于 Next.js 的文档管理系统，用于存储和管理文档。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        GeistSans.variable,
        GeistMono.variable,
        localChineseFont.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
