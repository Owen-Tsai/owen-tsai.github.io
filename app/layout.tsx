import type { Metadata } from 'next'
import Font from 'next/font/local'
import '@/assets/globals.css'
import '@/assets/app.css'
import Navbar from '@/components/Navbar'
import Loader from '@/components/Loader'
import Transition from '@/components/Transition'
import { LoaderProvider } from '@/components/Loader/context'

const clashDisplay = Font({
  src: '../assets/clash.woff2',
  display: 'swap',
  variable: '--font-clash',
})

export const metadata: Metadata = {
  title: 'Owen',
  description: 'A blog',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${clashDisplay.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LoaderProvider>
          <Navbar />
          <Loader />
          <Transition>{children}</Transition>
        </LoaderProvider>
      </body>
    </html>
  )
}
