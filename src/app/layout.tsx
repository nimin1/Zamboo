import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zamboo - Code Games with a Funky Panda!',
  description: 'Kids team up with Zamboo the Funky Panda to create games through vibecoding. Learn programming concepts while having fun!',
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="min-h-screen bg-neutral-50">
          {children}
        </div>
      </body>
    </html>
  )
}