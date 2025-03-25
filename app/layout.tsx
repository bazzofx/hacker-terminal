import type React from "react"
import "@/app/globals.css"
import { Toaster } from "@/components/toaster"

export const metadata = {
  title: "HackerSim - Autonomous Hacker Terminal",
  description: "A simulated hacker terminal with autonomous actions",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}



import './globals.css'