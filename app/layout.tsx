import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono, Fira_Code } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-sans",
})

/** Favicon: `public/icon-hydra-4.svg` (+ `app/icon.svg` para Next). Probar otras: `-1`…`-3` en la URL. */
const APP_ICON_PATH = "/icon-hydra-4.svg?v=5"

export const metadata: Metadata = {
  title: "HYDRA - Live Coding Video Synthesizer",
  description:
    "Interactive documentation for Hydra, a live-coding video synthesizer by Olivia Jack. Explore real-time visual synthesis with modular functions.",
  generator: "v0.app",
  icons: {
    icon: [{ url: APP_ICON_PATH, type: "image/svg+xml" }],
    apple: APP_ICON_PATH,
    shortcut: APP_ICON_PATH,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${firaCode.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
