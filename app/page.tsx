"use client"

import type React from "react"

import { useState } from "react"
import {
  Copy,
  Check,
  Zap,
  Palette,
  Grid3x3,
  Layers,
  Radio,
  Box,
  Activity,
  Play,
  Waves,
  Plus,
  Trophy,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { HydraPlayground } from "@/components/hydra-playground"
import { motion, AnimatePresence } from "framer-motion"
import { ChallengesView } from "@/components/challenges-view"

export default function HydraDocumentation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [playgroundCode, setPlaygroundCode] = useState("osc(20, 0.1, 0.8).out()")
  const [isCodeUpdated, setIsCodeUpdated] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const [activeTab, setActiveTab] = useState("guide")

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const playInPlayground = (code: string) => {
    setPlaygroundCode(code)
    setIsCodeUpdated(true)
    setTimeout(() => setIsCodeUpdated(false), 1000)

    // Scroll to playground
    const playgroundElement = document.getElementById("hydra-playground")
    if (playgroundElement) {
      playgroundElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const appendToPlayground = (atomicFunction: string) => {
    let currentCode = playgroundCode.trim()

    // If editor is empty, create a default source and append
    if (!currentCode) {
      playInPlayground(`osc(10, 0.1, 0.2)${atomicFunction}`)
      return
    }

        // Remove .out() and its variations from the end

    // Agregamos la bandera 'm' para que $ funcione con saltos de línea 
// y permitimos espacios opcionales antes del punto si fuera necesario.
    const outPattern = /\.out\s*\(\s*(?:o[0-3])?\s*\)\s*$/m;

    const match = currentCode.match(outPattern);
    let outSuffix;
    if (match) {
      // Guardamos el sufijo exacto encontrado (ej. ".out(o1)")
      outSuffix = match[0].trim();
      
      // Eliminamos el sufijo del código original
      currentCode = currentCode.replace(outPattern, "").trim();
    }

    // Ensure atomic function starts with a dot
    const cleanNewFunction = atomicFunction.startsWith(".") ? atomicFunction : `.${atomicFunction}`

    console.log("currentCode", currentCode);
    
    // Build the chained code
    const chainedCode = `${currentCode}${cleanNewFunction}${outSuffix}`

    // Update and trigger pulse animation
    setPlaygroundCode(chainedCode)
    setIsPulsing(true)
    setIsCodeUpdated(true)

    setTimeout(() => {
      setIsPulsing(false)
      setIsCodeUpdated(false)
    }, 1000)

    // Scroll to playground
    const playgroundElement = document.getElementById("hydra-playground")
    if (playgroundElement) {
      playgroundElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-neon-purple rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tight">HYDRA</h1>
              <p className="text-xs text-muted-foreground font-mono">Live Coding Video Synthesizer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://hydra.ojack.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-neon-green hover:text-neon-green/80 transition-colors"
            >
              Launch Editor
            </a>
            <a
              href="https://github.com/ojack/hydra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-muted/50 h-11 mb-8">
            <TabsTrigger
              value="guide"
              className="font-mono text-sm data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple"
            >
              <Radio className="w-4 h-4 mr-2" />
              Guide & API
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="font-mono text-sm data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Creative Challenges
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="guide" className="mt-0">
              <motion.div
                key="guide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid lg:grid-cols-[1fr_400px] gap-8"
              >
                {/* Main Content */}
                <div className="space-y-8">
                  {/* Hero Section */}
                  <section className="space-y-4">
                    <div className="inline-block px-3 py-1 bg-neon-purple/20 border border-neon-purple/50 rounded-full">
                      <span className="text-sm font-mono text-neon-purple">Created by Olivia Jack</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold font-mono tracking-tight text-balance leading-tight">
                      Visual Synthesis with Live Code
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl text-pretty">
                      A set of tools for live coding visuals, inspired by modular analog synthesizers. Explore real-time
                      video routing, dynamic mixing, and coordinate transforms through chainable functions.
                    </p>
                  </section>

                  {/* Conceptual Explainer */}
                  <section>
                    <Card className="glass-card border-neon-green/20">
                      <CardHeader>
                        <CardTitle className="font-mono flex items-center gap-2">
                          <Radio className="w-5 h-5 text-neon-green" />
                          Core Concepts
                        </CardTitle>
                        <CardDescription>Understanding Hydra&apos;s modular approach</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <h4 className="font-mono text-neon-green font-semibold">Oscillators</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            The fundamental building block. <code className="code-inline">osc()</code> generates visual
                            patterns controlled by three parameters: <strong>frequency</strong> (speed of oscillation),
                            <strong>sync</strong> (phase synchronization), and <strong>RGB offset</strong> (color
                            shift).
                          </p>
                          <CodeBlock
                            code="osc(20, 0.1, 0.8).out()"
                            id="osc-basic"
                            onCopy={copyToClipboard}
                            copied={copiedCode === "osc-basic"}
                            onPlay={playInPlayground}
                            onAppend={appendToPlayground}
                          />
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-mono text-neon-purple font-semibold">Modulation</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            <code className="code-inline">modulate()</code> uses the{" "}
                            <strong>red and green channels</strong> of a source texture to distort the{" "}
                            <strong>x and y coordinates</strong> of a base texture. This creates feedback loops and
                            complex visual interactions.
                          </p>
                          <CodeBlock
                            code={`osc(21, 0).modulate(o1).out(o0)
osc(40).out(o1)`}
                            id="modulate-basic"
                            onCopy={copyToClipboard}
                            copied={copiedCode === "modulate-basic"}
                            onPlay={playInPlayground}
                            onAppend={appendToPlayground}
                          />
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-mono text-neon-green font-semibold">Output Buffers</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Hydra provides four independent output buffers (<code className="code-inline">o0</code>,{" "}
                            <code className="code-inline">o1</code>, <code className="code-inline">o2</code>,{" "}
                            <code className="code-inline">o3</code>) that can be mixed, blended, and composed together.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* API Documentation */}
                  <section>
                    <h3 className="text-2xl font-bold font-mono mb-4">API Reference</h3>
                    <Tabs defaultValue="sources" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 bg-muted/50">
                        <TabsTrigger value="sources" className="font-mono text-xs">
                          Sources
                        </TabsTrigger>
                        <TabsTrigger value="geometry" className="font-mono text-xs">
                          Geometry
                        </TabsTrigger>
                        <TabsTrigger value="color" className="font-mono text-xs">
                          Color
                        </TabsTrigger>
                        <TabsTrigger value="modulate" className="font-mono text-xs">
                          Modulate
                        </TabsTrigger>
                        <TabsTrigger value="globals" className="font-mono text-xs hidden lg:block">
                          Globals
                        </TabsTrigger>
                      </TabsList>

                      {/* Sources Tab */}
                      <TabsContent value="sources" className="space-y-4 mt-6">
                        <FunctionCard
                          icon={<Waves className="w-5 h-5 text-neon-green" />}
                          name="osc"
                          signature="osc(frequency, sync, offset)"
                          defaults="frequency = 60, sync = 0.1, offset = 0"
                          description="Generates an oscillating pattern. Frequency controls speed, sync controls synchronization, and offset shifts the pattern."
                          example="osc(30, 0.1, 0.8).out()"
                          atomicFunction="osc(30, 0.1, 0.8)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Box className="w-5 h-5" />}
                          name="shape"
                          signature="shape(sides, radius, smoothing)"
                          defaults="sides: 3.0, radius: 0.3, smoothing: 0.01"
                          description="Generates geometric shapes. Adjust sides for different polygons."
                          example="shape(4, 0.5, 0.01).out()"
                          atomicFunction="shape(4, 0.5, 0.01)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Activity className="w-5 h-5 text-neon-green" />}
                          name="noise"
                          signature="noise(scale, offset)"
                          defaults="scale = 10, offset = 0.1"
                          description="Creates organic noise patterns. Scale controls the size of noise cells."
                          example="noise(5, 0.2).out()"
                          atomicFunction="noise(5, 0.2)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Box className="w-5 h-5" />}
                          name="voronoi"
                          signature="voronoi(scale, speed, blending)"
                          defaults="scale: 5.0, speed: 0.3, blending: 0.3"
                          description="Generates cellular/voronoi patterns."
                          example="voronoi(5, 0.3, 0.3).out()"
                          atomicFunction="voronoi(5, 0.3, 0.3)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Box className="w-5 h-5" />}
                          name="solid"
                          signature="solid(r, g, b, a)"
                          defaults="r: 0.0, g: 0.0, b: 0.0, a: 1.0"
                          description="Generates a solid color using RGBA values."
                          example="solid(0.2, 0.8, 0.5, 1).out()"
                          atomicFunction="solid(0.2, 0.8, 0.5, 1)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Box className="w-5 h-5" />}
                          name="gradient"
                          signature="gradient(speed)"
                          defaults="speed: 0.0"
                          description="Generates an animated gradient."
                          example="gradient(1).out()"
                          atomicFunction="gradient(1)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />
                      </TabsContent>

                      {/* Geometry Tab */}
                      <TabsContent value="geometry" className="space-y-4 mt-6">
                        <FunctionCard
                          icon={<Grid3x3 className="w-5 h-5" />}
                          name="kaleid"
                          signature="kaleid(nSides)"
                          defaults="nSides: 4.0"
                          description="Creates a kaleidoscope effect by repeating the texture n times around a center point."
                          example="src(s0).kaleid(4).out()"
                          atomicFunction="kaleid(4)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Grid3x3 className="w-5 h-5" />}
                          name="rotate"
                          signature="rotate(angle, speed)"
                          defaults="angle: 10.0, speed: 0.0"
                          description="Rotates the texture by the specified angle in radians. Speed adds continuous rotation."
                          example="osc(20).rotate(0.8).out()"
                          atomicFunction="rotate(0.8)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Grid3x3 className="w-5 h-5" />}
                          name="scale"
                          signature="scale(size, xMult, yMult)"
                          defaults="size: 1.5, xMult: 1.0, yMult: 1.0"
                          description="Scales the texture. xMult and yMult allow non-uniform scaling."
                          example="osc(10).scale(1.5, 1, 2).out()"
                          atomicFunction="scale(1.5, 1, 2)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Grid3x3 className="w-5 h-5" />}
                          name="pixelate"
                          signature="pixelate(x, y)"
                          defaults="x: 20.0, y: 20.0"
                          description="Pixelates the texture with the specified number of segments."
                          example="osc(20).pixelate(20, 30).out()"
                          atomicFunction="pixelate(20, 30)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Grid3x3 className="w-5 h-5" />}
                          name="repeat"
                          signature="repeat(x, y)"
                          defaults="x: 3.0, y: 3.0"
                          description="Repeats the texture in a grid pattern."
                          example="shape(4).repeat(3, 3).out()"
                          atomicFunction="repeat(3, 3)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Grid3x3 className="w-5 h-5" />}
                          name="scrollX / scrollY"
                          signature="scrollX(amount, speed)"
                          defaults="amount: 0.5, speed: 0.0"
                          description="Scrolls the texture horizontally or vertically."
                          example="osc(10).scrollX(0.5, 0.1).out()"
                          atomicFunction="scrollX(0.5, 0.1)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />
                      </TabsContent>

                      {/* Color Tab */}
                      <TabsContent value="color" className="space-y-4 mt-6">
                        <FunctionCard
                          icon={<Palette className="w-5 h-5" />}
                          name="contrast"
                          signature="contrast(amount)"
                          defaults="amount: 1.6"
                          description="Adjusts the contrast of the texture. Higher values increase contrast."
                          example="osc(10).contrast(2.5).out()"
                          atomicFunction="contrast(2.5)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Palette className="w-5 h-5" />}
                          name="color"
                          signature="color(r, g, b)"
                          defaults="r: 1.0, g: 1.0, b: 1.0"
                          description="Colorizes the texture by multiplying RGB channels."
                          example="osc(10).color(1, 0.5, 0.8).out()"
                          atomicFunction="color(1, 0.5, 0.8)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Palette className="w-5 h-5" />}
                          name="colorama"
                          signature="colorama(amount)"
                          defaults="amount: 0.005"
                          description="Shifts HSV values to create psychedelic color effects."
                          example="osc(10).colorama(0.5).out()"
                          atomicFunction="colorama(0.5)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Palette className="w-5 h-5" />}
                          name="invert"
                          signature="invert(amount)"
                          defaults="amount: 1.0"
                          description="Inverts the colors of the texture. Amount controls intensity."
                          example="osc(10).invert(1.0).out()"
                          atomicFunction="invert(1.0)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Palette className="w-5 h-5" />}
                          name="luma"
                          signature="luma(threshold, tolerance)"
                          defaults="threshold: 0.5, tolerance: 0.1"
                          description="Creates luminance-based transparency for compositing."
                          example="osc(10).luma(0.5, 0.1).out()"
                          atomicFunction="luma(0.5, 0.1)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Palette className="w-5 h-5" />}
                          name="thresh"
                          signature="thresh(threshold, tolerance)"
                          defaults="threshold: 0.5, tolerance: 0.04"
                          description="Creates a threshold effect, converting to black and white."
                          example="osc(10).thresh(0.5).out()"
                          atomicFunction="thresh(0.5)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />
                      </TabsContent>

                      {/* Modulate Tab */}
                      <TabsContent value="modulate" className="space-y-4 mt-6">
                        <FunctionCard
                          icon={<Layers className="w-5 h-5" />}
                          name="modulate"
                          signature="modulate(texture, amount)"
                          defaults="amount: 0.1"
                          description="Uses red/green channels of texture to distort x/y coordinates of base texture."
                          example={`osc(21, 0).modulate(o1).out(o0)
osc(40).out(o1)`}
                          atomicFunction="modulate(osc(10), 0.5)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Layers className="w-5 h-5" />}
                          name="modulateRotate"
                          signature="modulateRotate(texture, multiple, offset)"
                          defaults="multiple: 1.0, offset: 0.0"
                          description="Modulates rotation using a texture source."
                          example="osc(10).modulateRotate(o1, 2).out()"
                          atomicFunction="modulateRotate(osc(10), 2)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Layers className="w-5 h-5" />}
                          name="modulateScale"
                          signature="modulateScale(texture, multiple, offset)"
                          defaults="multiple: 1.0, offset: 0.0"
                          description="Modulates scale using a texture source."
                          example="osc(10).modulateScale(o1, 0.5).out()"
                          atomicFunction="modulateScale(osc(10), 0.5)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Layers className="w-5 h-5" />}
                          name="modulateKaleid"
                          signature="modulateKaleid(texture, nSides)"
                          defaults="nSides: 4.0"
                          description="Modulates kaleidoscope effect using a texture source."
                          example="osc(10).modulateKaleid(o1, 4).out()"
                          atomicFunction="modulateKaleid(osc(10), 4)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Layers className="w-5 h-5" />}
                          name="modulatePixelate"
                          signature="modulatePixelate(texture, multiple, offset)"
                          defaults="multiple: 10.0, offset: 3.0"
                          description="Modulates pixelation using a texture source."
                          example="osc(10).modulatePixelate(o1, 10).out()"
                          atomicFunction="modulatePixelate(osc(10), 10)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />

                        <FunctionCard
                          icon={<Layers className="w-5 h-5" />}
                          name="modulateHue"
                          signature="modulateHue(texture, amount)"
                          defaults="amount: 1.0"
                          description="Modulates hue using a texture source."
                          example="osc(10).modulateHue(o1, 0.5).out()"
                          atomicFunction="modulateHue(osc(10), 0.5)"
                          onCopy={copyToClipboard}
                          copied={copiedCode}
                          onPlay={playInPlayground}
                          onAppend={appendToPlayground}
                        />
                      </TabsContent>

                      {/* Globals Tab */}
                      <TabsContent value="globals" className="space-y-4 mt-6">
                        <Card className="glass-card border-neon-green/20">
                          <CardHeader>
                            <CardTitle className="font-mono text-lg flex items-center gap-2">
                              <Activity className="w-5 h-5 text-neon-green" />
                              time
                            </CardTitle>
                            <CardDescription className="font-mono text-xs">
                              Global variable representing milliseconds since page load
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Use <code className="code-inline">time</code> to create dynamic animations that evolve
                              continuously.
                            </p>
                            <CodeBlock
                              code="osc(() => 100 * Math.sin(time * 0.1)).out()"
                              id="time-example"
                              onCopy={copyToClipboard}
                              copied={copiedCode === "time-example"}
                              onPlay={playInPlayground}
                              onAppend={appendToPlayground}
                            />
                          </CardContent>
                        </Card>

                        <Card className="glass-card border-neon-purple/20">
                          <CardHeader>
                            <CardTitle className="font-mono text-lg flex items-center gap-2">
                              <Activity className="w-5 h-5 text-neon-purple" />
                              mouse
                            </CardTitle>
                            <CardDescription className="font-mono text-xs">
                              Global object with .x and .y properties for mouse position
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              <code className="code-inline">mouse.x</code> and{" "}
                              <code className="code-inline">mouse.y</code> provide normalized mouse coordinates (0-1)
                              for interactive visuals.
                            </p>
                            <CodeBlock
                              code="osc(() => mouse.x * 100).out()"
                              id="mouse-example"
                              onCopy={copyToClipboard}
                              copied={copiedCode === "mouse-example"}
                              onPlay={playInPlayground}
                              onAppend={appendToPlayground}
                            />
                          </CardContent>
                        </Card>

                        <Card className="glass-card border-neon-green/20">
                          <CardHeader>
                            <CardTitle className="font-mono text-lg">Dynamic Parameters</CardTitle>
                            <CardDescription className="font-mono text-xs">
                              Use functions instead of static values
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Any parameter can be a function that returns a value, enabling dynamic and responsive
                              visuals.
                            </p>
                            <CodeBlock
                              code={`// ES6 arrow function syntax
osc(() => 50 + 50 * Math.sin(time * 0.1), 0.1, () => mouse.x).out()`}
                              id="dynamic-example"
                              onCopy={copyToClipboard}
                              copied={copiedCode === "dynamic-example"}
                              onPlay={playInPlayground}
                              onAppend={appendToPlayground}
                            />
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </section>

                  {/* Advanced Features */}
                  <section>
                    <h3 className="text-2xl font-bold font-mono mb-4">Advanced Features</h3>
                    <Accordion type="single" collapsible className="space-y-2">
                      <AccordionItem value="webcam" className="glass-card border-neon-green/20 px-6">
                        <AccordionTrigger className="font-mono hover:text-neon-green">Webcam Input</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Initialize your webcam as a source buffer and apply effects in real-time.
                          </p>
                          <CodeBlock
                            code={`// Initialize webcam to source buffer s0
s0.initCam()

// Render webcam with kaleidoscope effect
src(s0).kaleid(4).out()`}
                            id="webcam-example"
                            onCopy={copyToClipboard}
                            copied={copiedCode === "webcam-example"}
                            onPlay={playInPlayground}
                            onAppend={appendToPlayground}
                          />
                          <p className="text-xs text-muted-foreground">
                            If you have multiple cameras, select by index:{" "}
                            <code className="code-inline">s0.initCam(1)</code>
                          </p>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="buffers" className="glass-card border-neon-purple/20 px-6">
                        <AccordionTrigger className="font-mono hover:text-neon-purple">
                          Multiple Output Buffers
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Use four independent output buffers (o0, o1, o2, o3) to create complex compositions.
                          </p>
                          <CodeBlock
                            code={`// Render different patterns to different buffers
osc(10).out(o0)
shape(4).out(o1)

// Compose them together
osc(10).blend(o1).out(o2)

// Render specific buffer
render(o2)`}
                            id="buffers-example"
                            onCopy={copyToClipboard}
                            copied={copiedCode === "buffers-example"}
                            onPlay={playInPlayground}
                            onAppend={appendToPlayground}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="blend" className="glass-card border-neon-green/20 px-6">
                        <AccordionTrigger className="font-mono hover:text-neon-green">Blending Modes</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Combine textures using blend(), diff(), mult(), add(), and mask() functions.
                          </p>
                          <CodeBlock
                            code={`// Blend two oscillators
osc(10).blend(osc(200)).out()

// Difference compositing
osc(10).rotate(0.5).diff(osc(200)).out()

// Multiply colors
osc(10).mult(noise(5)).out()`}
                            id="blend-example"
                            onCopy={copyToClipboard}
                            copied={copiedCode === "blend-example"}
                            onPlay={playInPlayground}
                            onAppend={appendToPlayground}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="audio" className="glass-card border-neon-purple/20 px-6">
                        <AccordionTrigger className="font-mono hover:text-neon-purple">
                          Audio Reactivity (Experimental)
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Use FFT audio analysis to drive visual parameters. Access via the{" "}
                            <code className="code-inline">a</code> object.
                          </p>
                          <CodeBlock
                            code={`// Show FFT visualization
a.show()

// Set number of frequency bins
a.setBins(6)

// Use audio data to control parameters
osc(10, 0, () => a.fft[0] * 4).out()

// Adjust sensitivity
a.setCutoff(4)
a.setScale(2)
a.setSmooth(0.8)`}
                            id="audio-example"
                            onCopy={copyToClipboard}
                            copied={copiedCode === "audio-example"}
                            onPlay={playInPlayground}
                            onAppend={appendToPlayground}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="remote" className="glass-card border-neon-green/20 px-6">
                        <AccordionTrigger className="font-mono hover:text-neon-green">Remote Streams</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Connect multiple Hydra instances over the network using WebRTC for collaborative
                            performances.
                          </p>
                          <CodeBlock
                            code={`// On sender window: set a name
pb.setName("myGraphics")

// On receiver window: connect to stream
s0.initStream("myGraphics")
src(s0).out()

// List available streams
pb.list()`}
                            id="remote-example"
                            onCopy={copyToClipboard}
                            copied={copiedCode === "remote-example"}
                            onPlay={playInPlayground}
                            onAppend={appendToPlayground}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </section>
                </div>

                {/* Sidebar with Playground */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <div id="hydra-playground">
                    <HydraPlayground
                      code={playgroundCode}
                      setCode={setPlaygroundCode}
                      isUpdated={isCodeUpdated}
                      isPulsing={isPulsing}
                    />
                  </div>
                  <Card className="glass-card border-neon-green/20 mt-4">
                    <CardHeader>
                      <CardTitle className="font-mono text-sm">Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <a
                        href="https://hydra.ojack.xyz/api/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-neon-green hover:text-neon-green/80 font-mono transition-colors"
                      >
                        → Official API Docs
                      </a>
                      <a
                        href="https://github.com/ojack/hydra"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-neon-green hover:text-neon-green/80 font-mono transition-colors"
                      >
                        → GitHub Repository
                      </a>
                      <a
                        href="https://hydra.ojack.xyz/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-neon-green hover:text-neon-green/80 font-mono transition-colors"
                      >
                        → Launch Editor
                      </a>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="challenges" className="mt-0">
              <motion.div
                key="challenges"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ChallengesView
                  playgroundCode={playgroundCode}
                  onLoadChallenge={playInPlayground}
                  onVerify={() => {}}
                />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}

function CodeBlock({
  code,
  id,
  onCopy,
  copied,
  onPlay,
  onAppend,
}: {
  code: string
  id: string
  onCopy: (code: string, id: string) => void
  copied: boolean
  onPlay?: (code: string) => void
  onAppend?: (code: string) => void
}) {
  return (
    <div className="relative group">
      <pre className="code-block text-xs sm:text-sm p-4 rounded-lg overflow-x-auto">
        <code className="font-mono">{code}</code>
      </pre>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onAppend && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 bg-background/80 hover:bg-neon-green/20"
            onClick={() => onAppend(code)}
            title="Append to current code"
          >
            <Plus className="w-4 h-4 text-neon-green" />
          </Button>
        )}
        {onPlay && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 bg-background/80 hover:bg-neon-purple/20"
            onClick={() => onPlay(code)}
            title="Play in Playground"
          >
            <Play className="w-4 h-4 text-neon-purple fill-neon-purple" />
          </Button>
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8 bg-background/80" onClick={() => onCopy(code, id)}>
          {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}

function FunctionCard({
  icon,
  name,
  signature,
  defaults,
  description,
  example,
  atomicFunction,
  onCopy,
  copied,
  onPlay,
  onAppend,
}: {
  icon: React.ReactNode
  name: string
  signature: string
  defaults: string
  description: string
  example: string
  atomicFunction?: string
  onCopy: (code: string, id: string) => void
  copied: string | null
  onPlay?: (code: string) => void
  onAppend?: (code: string) => void
}) {
  const id = `${name}-card`
  return (
    <Card className="glass-card border-border/50 hover:border-neon-green/50 transition-colors">
      <CardHeader>
        <CardTitle className="font-mono text-lg flex items-center gap-2">
          {icon}
          {name}
        </CardTitle>
        <p className="font-mono text-xs text-neon-purple mt-1">{signature}</p>
        <p className="font-mono text-xs text-muted-foreground">{defaults}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        <div className="relative group">
          <pre className="code-block text-xs sm:text-sm p-3 rounded-lg overflow-x-auto">
            <code className="font-mono">{example}</code>
          </pre>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onAppend && atomicFunction && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 bg-background/80 hover:bg-neon-green/20"
                onClick={() => onAppend(atomicFunction)}
                title="Append to current code"
              >
                <Plus className="w-3.5 h-3.5 text-neon-green" />
              </Button>
            )}
            {onPlay && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 bg-background/80 hover:bg-neon-purple/20"
                onClick={() => onPlay(example)}
                title="Play in Playground"
              >
                <Play className="w-3.5 h-3.5 text-neon-purple fill-neon-purple" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 bg-background/80"
              onClick={() => onCopy(example, id)}
            >
              {copied === id ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OutputBuffer({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`aspect-square rounded-lg border-2 flex items-center justify-center font-mono text-sm relative overflow-hidden ${
        active ? "border-neon-green bg-neon-green/5" : "border-border/50 bg-muted/20"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-neon-purple/5 to-neon-green/10 animate-pulse" />
      <span className={active ? "text-neon-green relative z-10" : "text-muted-foreground relative z-10"}>{label}</span>
    </div>
  )
}
