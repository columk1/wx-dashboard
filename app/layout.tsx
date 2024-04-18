import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chief Lap Copilot',
  description: 'A dashboard for local pilots.',
  // icons: [
  //   {
  //     rel: 'icon',
  //     type: 'image/x-icon',
  //     url: '/favicon.ico',
  //   },
  // ],
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
