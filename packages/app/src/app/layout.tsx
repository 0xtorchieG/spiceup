import type { Metadata } from 'next'
import { SITE_DESCRIPTION, SITE_NAME } from '@/utils/site'
import { Layout } from '@/components/Layout'
import { Web3Provider } from '@/context/Web3'
import { ToastProvider } from '@/context/Toaster'
import { type ReactNode } from 'react'
import '../assets/globals.css'

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
}

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <Web3Provider>
          <ToastProvider>
            <Layout>{props.children}</Layout>
          </ToastProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
