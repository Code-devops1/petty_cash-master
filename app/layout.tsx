import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import MainLayout from '@/components/main-layout'

export const metadata: Metadata = {
  title: {
    default: 'Petty Cash Management System - EasyNet Solutions',
    template: '%s | EasyNet Petty Cash System'
  },
  description: 'Streamline your company\'s petty cash management with our automated system. Secure approvals, M-Pesa integration, and comprehensive analytics.',
  keywords: ['petty cash', 'expense management', 'cash flow', 'M-Pesa payments', 'business automation', 'Kenya'],
  authors: [{ name: 'EasyNet Solutions' }],
  creator: 'EasyNet Solutions',
  publisher: 'EasyNet Solutions',
  generator: 'Next.js',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://petty-cash-master.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://petty-cash-master.vercel.app',
    title: 'Petty Cash Management System - EasyNet Solutions',
    description: 'Streamline your company\'s petty cash management with our automated system. Secure approvals, M-Pesa integration, and comprehensive analytics.',
    siteName: 'Petty Cash Management System',
    images: [
      {
        url: '/og-image.jpg', // You should create this image
        width: 1200,
        height: 630,
        alt: 'Petty Cash Management System Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Petty Cash Management System - EasyNet Solutions',
    description: 'Streamline your company\'s petty cash management with our automated system.',
    images: ['/og-image.jpg'], // You should create this image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code', // Add your Google verification code
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body 
        suppressHydrationWarning 
        className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <MainLayout>
            {children}
          </MainLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}