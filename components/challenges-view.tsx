"use client"

import { useState } from "react"
import { Trophy, Target, CheckCircle2, XCircle, Lightbulb, Play, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { HydraPlayground } from "@/components/hydra-playground"

interface Challenge {
  id: number
  title: string
  goal: string
  description: string
  starterCode: string
  mandatoryFunctions: string[]
  hint: string
  difficulty: "beginner" | "intermediate" | "advanced"
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: "The Pulsing Signal",
    goal: "Create a visual that oscillates rhythmically",
    description:
      "Use a basic oscillator and modify its frequency to create a dense pattern, then make it move using the sync parameter.",
    starterCode: "osc(10, 0.1, 0).out()",
    mandatoryFunctions: ["osc"],
    hint: "Increase the first parameter of osc() to at least 40 for a denser pattern.",
    difficulty: "beginner",
  },
  {
    id: 2,
    title: "The Geometric Kaleidoscope",
    goal: "Transform a simple shape into a complex mandala",
    description: "Start with a triangle (shape with 3 sides) and use the kaleid function to multiply it.",
    starterCode: "shape(3, 0.5, 0.01).out()",
    mandatoryFunctions: ["shape", "kaleid"],
    hint: "Chaining .kaleid(6) will create a hexagonal symmetry.",
    difficulty: "beginner",
  },
  {
    id: 3,
    title: "Color Distortion (The Codex Special)",
    goal: "Create a high-contrast inverted visual",
    description: "Take a Noise source and apply color transformations to make it look like 'digital fire'.",
    starterCode: "noise(10, 0.1).out()",
    mandatoryFunctions: ["noise", "colorama", "invert"],
    hint: "Chain .colorama(0.01) and then .invert() to achieve the effect.",
    difficulty: "intermediate",
  },
  {
    id: 4,
    title: "Modular Modulation",
    goal: "Use one texture to deform another",
    description: "This is a core Hydra concept. Use an oscillator to modulate a Voronoi pattern.",
    starterCode: "voronoi(5, 0.1).out()",
    mandatoryFunctions: ["voronoi", "modulate", "osc"],
    hint: "The syntax should look like .modulate(osc(10)) to see the deformation.",
    difficulty: "advanced",
  },
  {
    id: 5,
    title: 'The "Fire Flower" Recreation',
    goal: "Recreate the design mentioned on Page 2 of the CODEX",
    description: "Combine shape, color, and kaleid to build the Fire Flower.",
    starterCode: "// Start from scratch",
    mandatoryFunctions: ["shape", "color", "kaleid"],
    hint: "Use shape(5) for the petals and warm colors like color(1, 0.2, 0).",
    difficulty: "advanced",
  },
]

interface ChallengesViewProps {
  playgroundCode: string
  onLoadChallenge: (code: string) => void
  onVerify: () => void
}

export function ChallengesView({ playgroundCode, onLoadChallenge, onVerify }: ChallengesViewProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [verificationResults, setVerificationResults] = useState<{ [key: number]: boolean | null }>({})
  const [localPlaygroundCode, setLocalPlaygroundCode] = useState("osc(20, 0.1, 0.8).out()")
  const [isCodeUpdated, setIsCodeUpdated] = useState(false)

  const loadChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setLocalPlaygroundCode(challenge.starterCode)
    setIsCodeUpdated(true)
    setTimeout(() => setIsCodeUpdated(false), 1000)

    // Clear previous verification result for this challenge
    setVerificationResults((prev) => ({ ...prev, [challenge.id]: null }))
  }

  const verifySolution = (challenge: Challenge) => {
    const code = localPlaygroundCode.toLowerCase()
    const allFunctionsPresent = challenge.mandatoryFunctions.every((func) => code.includes(func.toLowerCase()))

    setVerificationResults((prev) => ({
      ...prev,
      [challenge.id]: allFunctionsPresent,
    }))

    onVerify()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-neon-green border-neon-green/50 bg-neon-green/10"
      case "intermediate":
        return "text-yellow-400 border-yellow-400/50 bg-yellow-400/10"
      case "advanced":
        return "text-neon-purple border-neon-purple/50 bg-neon-purple/10"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_500px] gap-8">
      {/* Challenges List */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-purple rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-background" />
            </div>
            <div>
              <h2 className="text-3xl font-bold font-mono tracking-tight">Creative Challenges</h2>
              <p className="text-sm text-muted-foreground font-mono">Learn by building specific visual effects</p>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Each challenge teaches a core Hydra concept. Load the starter code, experiment, and verify your solution
            uses the required functions.
          </p>
        </div>

        <div className="space-y-4">
          {challenges.map((challenge, index) => {
            const verificationStatus = verificationResults[challenge.id]
            const isSelected = selectedChallenge?.id === challenge.id

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`glass-card transition-all duration-300 cursor-pointer hover:border-neon-purple/50 ${
                    isSelected ? "border-neon-purple ring-2 ring-neon-purple/30" : "border-border/50"
                  } ${
                    verificationStatus === true ? "bg-neon-green/5" : verificationStatus === false ? "bg-red-500/5" : ""
                  }`}
                  onClick={() => loadChallenge(challenge)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            Challenge {challenge.id}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`font-mono text-xs ${getDifficultyColor(challenge.difficulty)}`}
                          >
                            {challenge.difficulty}
                          </Badge>
                          {verificationStatus === true && (
                            <Badge
                              variant="outline"
                              className="font-mono text-xs text-neon-green border-neon-green/50 bg-neon-green/10"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Solved
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="font-mono text-lg">{challenge.title}</CardTitle>
                        <CardDescription className="mt-1">
                          <Target className="w-3 h-3 inline mr-1" />
                          {challenge.goal}
                        </CardDescription>
                      </div>
                      {verificationStatus === true && (
                        <CheckCircle2 className="w-6 h-6 text-neon-green flex-shrink-0" />
                      )}
                      {verificationStatus === false && <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>

                    <div className="p-3 bg-black/30 rounded-lg border border-neon-purple/20">
                      <p className="text-xs font-mono text-muted-foreground mb-1">Required functions:</p>
                      <div className="flex flex-wrap gap-2">
                        {challenge.mandatoryFunctions.map((func) => (
                          <code key={func} className="code-inline text-neon-green">
                            {func}()
                          </code>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          loadChallenge(challenge)
                        }}
                        className="font-mono text-xs bg-neon-purple hover:bg-neon-purple/80"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Load Challenge
                      </Button>
                      {isSelected && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            verifySolution(challenge)
                          }}
                          className="font-mono text-xs border-neon-green/50 text-neon-green hover:bg-neon-green/10"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Verify Solution
                        </Button>
                      )}
                    </div>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-3 border-t border-border/50"
                      >
                        <div className="flex items-start gap-2 p-3 bg-neon-purple/5 rounded-lg border border-neon-purple/20">
                          <Lightbulb className="w-4 h-4 text-neon-purple mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-mono text-neon-purple font-semibold mb-1">Hint:</p>
                            <p className="text-xs text-muted-foreground">{challenge.hint}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {verificationStatus === false && isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-3 bg-red-500/10 rounded-lg border border-red-500/30"
                      >
                        <p className="text-xs font-mono text-red-400">
                          Not quite! Make sure your code includes all required functions:{" "}
                          {challenge.mandatoryFunctions.join(", ")}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Persistent Playground */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div id="hydra-playground">
          <HydraPlayground code={localPlaygroundCode} setCode={setLocalPlaygroundCode} isUpdated={isCodeUpdated} />
        </div>

        {selectedChallenge && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <Card className="glass-card border-neon-green/20">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-neon-green" />
                  Current Challenge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-mono text-neon-green">{selectedChallenge.title}</p>
                <p className="text-xs text-muted-foreground">{selectedChallenge.goal}</p>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Required functions:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedChallenge.mandatoryFunctions.map((func) => (
                      <Badge
                        key={func}
                        variant="outline"
                        className="font-mono text-[10px] text-neon-green border-neon-green/30"
                      >
                        {func}()
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
