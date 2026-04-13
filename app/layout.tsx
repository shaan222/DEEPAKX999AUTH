import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import RecaptchaScript from '@/components/RecaptchaScript'
import AuthProviderWrapper from '@/components/AuthProviderWrapper'

export const metadata: Metadata = {
  title: 'DEEPAKX999AUTH - License & Authentication System',
  description: 'Modern authentication and license management system',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <RecaptchaScript />
      </head>
      <body>
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}


