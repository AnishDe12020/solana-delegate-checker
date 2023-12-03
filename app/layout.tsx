import "@/styles/globals.css"

import { Metadata } from "next"
import Script from "next/script"
import { Link } from "@nextui-org/link"
import clsx from "clsx"

import { fontSans } from "@/config/fonts"
import { siteConfig } from "@/config/site"
import Toaster from "@/components/sonner-toaster"

import { Providers } from "./providers"

require("@solana/wallet-adapter-react-ui/styles.css")

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    url: siteConfig.url,
    images: [
      {
        url: siteConfig.opengraph,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL &&
          process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
            <Script
              src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
              data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
              strategy="lazyOnload"
            />
          )}
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              <Toaster />
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-16 gap-1">
              <span className="text-default-600">Created by</span>
              <Link
                isExternal
                className="flex items-center text-current"
                href="https://twitter.com/AnishDe12020"
                title="Anish's Twitter"
              >
                <p className="text-primary">Anish De</p>
              </Link>
              <span className="text-default-600">and</span>
              <Link
                isExternal
                className="flex items-center text-current"
                href="https://twitter.com/kb24x7"
                title="Kunal's Twitter"
              >
                <p className="text-primary">Kunal Bagaria</p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
