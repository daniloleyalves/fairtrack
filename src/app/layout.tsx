import { ReactScan } from '@components/react-scan';
import { Toaster } from '@components/ui/sonner';
import { ErrorBoundary } from '@components/error-boundary';
import type { Metadata } from 'next';
import { Geist, Londrina_Solid } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import { AuthProvider } from '@/lib/auth/auth-provider';
import NavigationLoadingIndicator from '@components/navigation-loading-indicator';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const londrinaSolid = Londrina_Solid({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-londrina-solid',
});

export const metadata: Metadata = {
  title: 'FairTrack',
  description:
    'Behalte den Überblick über deinen Foodsharing-Beitrag und trage aktiv zu einer Wirkungsmessung der Foodsharing-Bewegung bei',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FairTrack',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon-180x180.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning data-scroll-behavior='smooth'>
      <ReactScan />
      <body
        className={`${geistSans.variable} ${londrinaSolid.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <NavigationLoadingIndicator />
          {/* <AuthErrorBoundary> */}
          <AuthProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </AuthProvider>
          {/* </AuthErrorBoundary> */}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
