import type { Metadata, Viewport } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';

import { InstallPromptCapture } from '@/components/feedback/InstallPromptCapture';
import { AuthProvider } from '@/contexts/AuthContext';
import { THEME_INIT_SCRIPT } from '@/lib/theme/applyBaseColor';

import './globals.css';

const rounded = M_PLUS_Rounded_1c({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  preload: false,
  display: 'swap',
  variable: '--font-rounded',
});

const STARTUP_DEVICES: [number, number, number][] = [
  [440, 956, 3],
  [430, 932, 3],
  [428, 926, 3],
  [414, 896, 3],
  [414, 896, 2],
  [402, 874, 3],
  [393, 852, 3],
  [390, 844, 3],
  [375, 812, 3],
  [375, 667, 2],
];

export const metadata: Metadata = {
  metadataBase: new URL('https://unlist-pi.vercel.app'),
  title: 'ウンlist',
  description: '今日やることが一目でわかる、ADHDの人のためのTodoリスト',
  applicationName: 'ウンlist',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    title: 'ウンlist',
    statusBarStyle: 'default',
    startupImage: STARTUP_DEVICES.map(([width, height, ratio]) => ({
      url: `/splash/splash-${width * ratio}x${height * ratio}.png`,
      media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
    })),
  },
  openGraph: {
    title: 'ウンlist',
    description: '今日やることが一目でわかる、ADHDの人のためのTodoリスト',
    images: [{ url: '/ogp.png', width: 1200, height: 630 }],
    locale: 'ja_JP',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFE8F4' },
    { media: '(prefers-color-scheme: dark)', color: '#1D1319' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ja" className={`${rounded.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <InstallPromptCapture />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
