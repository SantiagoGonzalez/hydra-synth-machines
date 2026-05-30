"use client"

import { useState, useRef, useEffect } from "react"
import { Play, RotateCcw, Trash2, Terminal, Maximize2, AlertCircle, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface HydraPlaygroundProps {
  code: string
  setCode: (code: string) => void
  isUpdated: boolean
  isPulsing?: boolean
  onRun?: () => void
}

export function HydraPlayground({ code, setCode, isUpdated, isPulsing, onRun }: HydraPlaygroundProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hydraRef = useRef<any>(null)
  const synthRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)

  useEffect(() => {
    const loadHydra = async () => {
      try {
        const Hydra = (await import("hydra-synth")).default

        if (canvasRef.current && !hydraRef.current) {
          hydraRef.current = new Hydra({
            canvas: canvasRef.current,
            detectAudio: false,
            enableStreamCapture: false,
            makeGlobal: false,
          })

          synthRef.current = hydraRef.current.synth

          setTimeout(() => {
            runCode("osc(10, 0.1, 0.2).out()")
          }, 100)
        }
      } catch (err) {
        console.error("[v0] Failed to load Hydra:", err)
        setError("Failed to initialize Hydra engine")
      }
    }

    loadHydra()

    return () => {
      if (synthRef.current) {
        try {
          synthRef.current.hush()
        } catch (e) {
          console.error("[v0] Hydra cleanup error:", e)
        }
      }
    }
  }, [])

  const runCode = (codeToRun?: string) => {
    const executeCode = codeToRun || code

    if (!executeCode.trim()) {
      setError("Please enter some Hydra code")
      return
    }

    if (!synthRef.current) {
      setError("Hydra engine is not initialized yet")
      return
    }

    try {
      setError(null)
      synthRef.current.hush()

      const s = synthRef.current

      const boundFunctions = {
        osc: s.osc.bind(s),
        noise: s.noise.bind(s),
        voronoi: s.voronoi.bind(s),
        shape: s.shape.bind(s),
        gradient: s.gradient.bind(s),
        src: s.src.bind(s),
        solid: s.solid.bind(s),
        rotate: s.rotate?.bind(s),
        scale: s.scale?.bind(s),
        pixelate: s.pixelate?.bind(s),
        repeat: s.repeat?.bind(s),
        repeatX: s.repeatX?.bind(s),
        repeatY: s.repeatY?.bind(s),
        kaleid: s.kaleid?.bind(s),
        scroll: s.scroll?.bind(s),
        scrollX: s.scrollX?.bind(s),
        scrollY: s.scrollY?.bind(s),
        modulateRotate: s.modulateRotate?.bind(s),
        modulateScale: s.modulateScale?.bind(s),
        modulate: s.modulate?.bind(s),
        modulateHue: s.modulateHue?.bind(s),
        modulatePixelate: s.modulatePixelate?.bind(s),
        modulateRepeat: s.modulateRepeat?.bind(s),
        modulateRepeatX: s.modulateRepeatX?.bind(s),
        modulateRepeatY: s.modulateRepeatY?.bind(s),
        modulateKaleid: s.modulateKaleid?.bind(s),
        modulateScrollX: s.modulateScrollX?.bind(s),
        modulateScrollY: s.modulateScrollY?.bind(s),
        add: s.add?.bind(s),
        sub: s.sub?.bind(s),
        layer: s.layer?.bind(s),
        blend: s.blend?.bind(s),
        mult: s.mult?.bind(s),
        diff: s.diff?.bind(s),
        brightness: s.brightness?.bind(s),
        contrast: s.contrast?.bind(s),
        color: s.color?.bind(s),
        colorama: s.colorama?.bind(s),
        sum: s.sum?.bind(s),
        r: s.r?.bind(s),
        g: s.g?.bind(s),
        b: s.b?.bind(s),
        invert: s.invert?.bind(s),
        luma: s.luma?.bind(s),
        thresh: s.thresh?.bind(s),
        posterize: s.posterize?.bind(s),
        shift: s.shift?.bind(s),
        saturate: s.saturate?.bind(s),
        hue: s.hue?.bind(s),
        out: s.out?.bind(s),
        render: s.render?.bind(s),
        o0: s.o0,
        o1: s.o1,
        o2: s.o2,
        o3: s.o3,
        s0: s.s0,
        s1: s.s1,
        s2: s.s2,
        s3: s.s3,
        speed: s.speed,
        bpm: s.bpm,
        width: s.width,
        height: s.height,
        time: s.time,
        mouse: s.mouse,
        setResolution: s.setResolution?.bind(s),
        hush: s.hush?.bind(s),
        setFunction: s.setFunction?.bind(s),
      }

      const evalFunc = new Function(...Object.keys(boundFunctions), `return (${executeCode})`)

      const result = evalFunc(...Object.values(boundFunctions))

      if (result && typeof result.out === "function") {
        result.out()
      }

      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 300)

      if (onRun) {
        onRun()
      }
    } catch (err: any) {
      console.error("[v0] Hydra execution error:", err)
      setError(`Syntax Error: ${err.message || "Invalid Hydra code"}`)
    }
  }

  useEffect(() => {
    if (isUpdated && code) {
      runCode()
    }
  }, [isUpdated])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [code])

  const handleReset = () => {
    const defaultCode = "osc(20, 0.1, 0.8).out()"
    setCode(defaultCode)
    runCode(defaultCode)
  }

  const handleClear = () => {
    setCode("")
    if (synthRef.current) {
      synthRef.current.hush()
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <Card
      className={`glass-card border-neon-purple/20 transition-all duration-500 ${
        isUpdated ? "ring-2 ring-neon-purple shadow-[0_0_20px_rgba(168,85,247,0.4)]" : ""
      } ${isPulsing ? "animate-pulse ring-2 ring-neon-green shadow-[0_0_30px_rgba(34,197,94,0.5)]" : ""}`}
    >
      <CardHeader>
        <CardTitle className="font-mono flex items-center gap-2">
          <Terminal className="w-5 h-5 text-neon-purple" />
          Hydra Playground
        </CardTitle>
        <CardDescription>Write and execute live Hydra code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-[2px] bg-gradient-to-r from-neon-purple via-neon-green to-neon-purple rounded-lg opacity-50 blur-sm" />
          <div className="relative bg-black rounded-lg overflow-hidden border-2 border-neon-purple/50">
            {isFlashing && <div className="absolute inset-0 bg-neon-green/30 animate-ping pointer-events-none z-10" />}
            <canvas ref={canvasRef} className="w-full aspect-video bg-black" />

            <button
              onClick={toggleFullscreen}
              className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black/90 border border-neon-purple/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-neon-green" />
            </button>

            {error && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="max-w-md">
                  <Alert variant="destructive" className="border-red-500/50 bg-red-950/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-mono text-xs mt-2">{error}</AlertDescription>
                  </Alert>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-xs font-mono text-muted-foreground flex items-center justify-between">
            <span>Hydra Output (o0)</span>
            <span className="text-neon-green">16:9 • Live Render</span>
          </div>
        </div>

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault()
                runCode()
              }
            }}
            className="w-full min-h-[120px] p-4 bg-black/50 border-2 border-neon-purple/30 rounded-lg font-mono text-sm text-neon-green focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 resize-none transition-all"
            placeholder="Enter Hydra code here... (Ctrl+Enter to run)"
            spellCheck={false}
          />

          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={() => runCode()}
              className="font-mono text-xs bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              <Play className="w-3 h-3 mr-1" />
              Run
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="font-mono text-xs hover:text-neon-green hover:bg-neon-green/10"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="font-mono text-xs hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <div className="p-3 bg-muted/20 rounded-lg border border-border/50">
          <p className="text-xs font-mono text-muted-foreground">
            {isUpdated ? (
              <span className="text-neon-purple font-semibold">Code loaded! Click Run to execute.</span>
            ) : isPulsing ? (
              <span className="text-neon-green font-semibold">Function chained! Click Run to see the result.</span>
            ) : (
              <>
                Click <Play className="inline w-3 h-3 mx-1" /> to load code •{" "}
                <Plus className="inline w-3 h-3 mx-1 text-neon-green" /> to chain • Press{" "}
                <kbd className="px-1 py-0.5 bg-black/50 border border-neon-purple/30 rounded text-[10px]">
                  Ctrl+Enter
                </kbd>{" "}
                to run
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
