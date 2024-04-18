import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chief Lap Copilot',
  description: 'A dashboard for local pilots.',
  icons: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      url: '/icons/icon.ico',
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/icons/icon.svg',
      sizes: 'any',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/icons/apple-touch-icon.png',
    },
  ],
  metadataBase: new URL('https://chieflap.vercel.app'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
