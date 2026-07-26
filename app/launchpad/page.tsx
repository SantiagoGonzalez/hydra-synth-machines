"use client"

// Página del launchpad VJ: layout de 3 zonas con canvas, panel de params y banda de pads

import Link from "next/link"
import { ArrowLeft, Radio } from "lucide-react"
import { StageColumn } from "@/components/launchpad/stage-column"
import { ParamPanel } from "@/components/launchpad/param-panel"
import { PadBand } from "@/components/launchpad/pad-band"
import { FavoritesDialog } from "@/components/launchpad/favorites-dialog"

export default function LaunchpadPage() {
  return (
    <>
      {/* Desktop-only gate */}
      <div className="lg:hidden fixed inset-0 z-50 bg-black flex items-center justify-center p-6">
        <p className="font-mono text-sm text-white/40 text-center leading-relaxed">
          Hydra Launchpad requires a desktop viewport (≥1024px).
        </p>
      </div>

      <div className="hidden lg:flex h-screen flex-col overflow-hidden bg-black text-white">
        <header className="shrink-0 h-9 flex items-center justify-between px-3 border-b border-white/5">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-[9px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Link>

          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-[#44ff88] animate-pulse" />
            <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase">
              Hydra Launchpad
            </span>
          </div>

          <FavoritesDialog />
        </header>

        <main className="flex-1 min-h-0 grid grid-rows-[2fr_1fr]">
          <div className="min-h-0 grid grid-cols-[1fr_minmax(380px,30%)] gap-3 p-3">
            <StageColumn />
            <ParamPanel />
          </div>
          <PadBand />
        </main>

        <footer className="shrink-0 px-3 py-1.5 border-t border-white/5">
          <p className="font-mono text-[8px] text-white/15 text-center tracking-wider">
            Q–I / A–K / Z–, pads · space add · 1–5 tabs · shift+1–4 outputs · hold momentary · shift arm · alt select · enter apply · esc disarm · shift+backspace delete
          </p>
        </footer>
      </div>
    </>
  )
}
