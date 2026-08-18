import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
})

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
})

const title = 'img-creator — Atelier'
const description =
  "Atelier de génération d'images multi-modèles : un prompt, deux API (nano-banana-2, gpt-image-2), trois modes de travail et une comparaison A/B. Sans compte ni base de données — tout reste dans le navigateur."

export const metadata: Metadata = {
  metadataBase: new URL('https://img-generator-app.netlify.app'),
  title: { default: title, template: '%s — img-creator' },
  description,
  applicationName: 'img-creator',
  keywords: [
    "génération d'images",
    'IA',
    'nano-banana-2',
    'gpt-image-2',
    'prompt',
    'atelier',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'img-creator',
    url: '/',
    title,
    description,
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#08090d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-app text-body">
        {children}
        <script
          async
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "ef321ec6f5fa4044a696cecef364fedf"}'
        />
      </body>
    </html>
  )
}
