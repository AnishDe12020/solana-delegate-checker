"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { NextUIProvider } from "@nextui-org/system"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"

import ReactQueryProvider from "@/components/query-provider"
import { SolanaProvider } from "@/components/solana-provider"

export interface ProvidersProps {
  children: React.ReactNode
  themeProps?: ThemeProviderProps
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter()

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <ReactQueryProvider>
          <SolanaProvider>{children}</SolanaProvider>
        </ReactQueryProvider>
      </NextThemesProvider>
    </NextUIProvider>
  )
}
