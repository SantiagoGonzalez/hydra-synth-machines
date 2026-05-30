"use client"

// Página del launchpad VJ: orquesta el grid de pads, el canvas Hydra y el preview de cadena

import Link from "next/link"
import { ArrowLeft, Radio } from "lucide-react"
import { MachineLayout } from "@/components/launchpad/machine-layout"
import { HydraCanvas } from "@/components/launchpad/hydra-canvas"
import { ChainPreview } from "@/components/launchpad/chain-preview"

export default function LaunchpadPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-mono text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to docs
        </Link>

        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#44ff88] animate-pulse" />
          <span className="font-mono text-[11px] text-white/60 tracking-widest uppercase">
            Hydra Launchpad
          </span>
        </div>

        <div className="font-mono text-[9px] text-white/15 uppercase tracking-wider">
          Machine v1
        </div>
      </header>

      {/* Main layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 max-w-screen-xl mx-auto w-full">
        {/* Left column: pad grid + params */}
        <section className="flex flex-col gap-4 min-w-0">
          <MachineLayout />
        </section>

        {/* Right column: canvas + chain preview */}
        <section className="flex flex-col gap-4 min-w-0">
          <HydraCanvas />
          <ChainPreview />
        </section>
      </main>

      {/* Footer hint */}
      <footer className="px-4 py-2 border-t border-white/5">
        <p className="font-mono text-[9px] text-white/15 text-center tracking-wider">
          tap pads to build a chain · adjust sliders for live control · T = toggle · M = momentary
        </p>
      </footer>
    </div>
  )
}
