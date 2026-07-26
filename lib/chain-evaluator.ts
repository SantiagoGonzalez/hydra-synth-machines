// Evaluador de cadenas Hydra: conecta el código compilado con el runtime de hydra-synth

import { EMPTY_CODE } from "@/lib/chain-compiler"

export interface HydraEvaluatorOptions {
  onError?: (message: string) => void
  onSuccess?: () => void
}

export interface HydraEvaluator {
  /** Ejecuta un string de código Hydra en el canvas asociado */
  run: (code: string, structural?: boolean) => void
  /** Silencia el canvas */
  hush: () => void
  /** Libera el engine (llamar en cleanup) */
  dispose: () => void
  /** Indica si el engine fue inicializado */
  readonly ready: boolean
}

/** Construye el objeto de funciones vinculadas al synth (whitelist del playground existente) */
function buildBoundFunctions(s: any): Record<string, unknown> {
  return {
    osc: s.osc?.bind(s),
    noise: s.noise?.bind(s),
    voronoi: s.voronoi?.bind(s),
    shape: s.shape?.bind(s),
    gradient: s.gradient?.bind(s),
    src: s.src?.bind(s),
    solid: s.solid?.bind(s),
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
}

/**
 * Crea un evaluador de cadenas Hydra vinculado a un canvas.
 * Retorna null si el canvas no está disponible.
 */
export async function createHydraEvaluator(
  canvas: HTMLCanvasElement,
  options: HydraEvaluatorOptions = {}
): Promise<HydraEvaluator> {
  const { onError, onSuccess } = options

  const HydraSynth = (await import("hydra-synth")).default

  const hydra = new HydraSynth({
    canvas,
    detectAudio: false,
    enableStreamCapture: false,
    makeGlobal: false,
    autoLoop: false,
  })

  const synth = hydra.synth
  let _ready = true

  // Loop raf propio (autoLoop de hydra no se puede detener): permite liberar el engine al desmontar
  let rafId = 0
  let lastFrame = performance.now()
  const frame = (now: number) => {
    hydra.tick(now - lastFrame)
    lastFrame = now
    rafId = requestAnimationFrame(frame)
  }
  rafId = requestAnimationFrame(frame)

  const run = (code: string, structural = false) => {
    if (!_ready) return

    try {
      if (structural) {
        synth.hush()
      }

      const bound = buildBoundFunctions(synth)
      const isMultiLine = code.includes("\n") || code.includes("render(")

      if (isMultiLine) {
        const evalFn = new Function(...Object.keys(bound), code)
        evalFn(...Object.values(bound))
      } else {
        const evalFn = new Function(...Object.keys(bound), `return (${code})`)
        const result = evalFn(...Object.values(bound))
        if (result && typeof result.out === "function") {
          result.out()
        }
      }

      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid Hydra expression"
      console.error("[launchpad] Hydra eval error:", err)
      onError?.(message)
    }
  }

  const hush = () => {
    if (_ready) synth.hush()
  }

  const dispose = () => {
    _ready = false
    cancelAnimationFrame(rafId)
    try {
      synth.hush()
      hydra.regl?.destroy()
    } catch {
      // ignorar errores en cleanup
    }
  }

  run(EMPTY_CODE, true)

  return {
    run,
    hush,
    dispose,
    get ready() {
      return _ready
    },
  }
}
