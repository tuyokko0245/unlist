import type { Metadata, Viewport } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';

import { THEME_INIT_SCRIPT } from '@/lib/theme/applyBaseColor';

import './globals.css';

const rounded = M_PLUS_Rounded_1c({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  preload: false,
  display: 'swap',
  variable: '--font-rounded',
});

export const metadata: Metadata = {
  title: 'ウンlist',
  description: '今日やることが一目でわかる、ADHDの人のためのTodoリスト',
};

export const viewport: Viewport = {
  themeColor: '#FBB6D8',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ja" className={`${rounded.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
