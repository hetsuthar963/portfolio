import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portfolio - Het Suthar',
  description: 'Created with 🔥',
  generator: 'v0.app',
  icons: {
        icon: '/x-logo-favicon.svg', // Path to your favicon
        apple: '/apple-icon.png', // Optional: Path to Apple touch icon
      },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}`,
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
