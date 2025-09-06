'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Zap, Rocket, ArrowRight, Code, Gamepad2 } from 'lucide-react'
import EmergentGameEngine from '@/components/game/EmergentGameEngine'

const ConceptFirstDemo: React.FC = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<'input' | 'analyzing' | 'designing' | 'playing'>('input')
  const [conceptData, setConceptData] = useState<{
    experienceAnalysis?: string
    gameImplementation?: string
    userVision?: string
  }>({})
  const [error, setError] = useState<string | null>(null)

  const generateConceptFirstGame = useCallback(async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    setCurrentPhase('analyzing')

    try {
      console.log('🚀 Starting concept-first generation...')
      
      const response = await fetch('/api/conceptFirst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        console.log('✨ Concept-first generation successful!')
        setConceptData({
          experienceAnalysis: data.experienceAnalysis,
          gameImplementation: data.gameImplementation,
          userVision: data.userVision
        })
        setCurrentPhase('designing')
        
        // Auto-advance to playing phase after a moment
        setTimeout(() => {
          setCurrentPhase('playing')
        }, 3000)
      } else {
        throw new Error(data.error || 'Generation failed')
      }
    } catch (err) {
      console.error('❌ Concept-first generation error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt])

  const examplePrompts = [
    "time-traveling puzzle where your past self helps solve present challenges",
    "empathic connection game where understanding others unlocks new abilities", 
    "musical ecosystem where sounds create living creatures",
    "gravity-painting game where you draw with physics",
    "memory palace builder where learning becomes architecture",
    "collaborative storytelling through gesture and color"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🚀 Concept-First Game Generation
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Experience the future of AI game design! No schema constraints - pure conceptual reasoning that generates 
            games through understanding experiences, not filling out forms.
          </p>
        </motion.div>

        {/* Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-900/20 border border-red-500/30 rounded-xl p-6"
          >
            <div className="flex items-center mb-4">
              <Code className="mr-3 text-red-400" size={24} />
              <h3 className="text-xl font-bold text-red-400">Schema-Constrained (Old)</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li>❌ AI fills predefined data structures</li>
              <li>❌ Creativity limited by schema boundaries</li>
              <li>❌ New concepts forced into old categories</li>
              <li>❌ "Form filling" not "experience design"</li>
              <li>❌ Predictable, template-like results</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-green-900/20 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center mb-4">
              <Brain className="mr-3 text-green-400" size={24} />
              <h3 className="text-xl font-bold text-green-400">Concept-First (Revolutionary)</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li>✅ AI reasons about player experiences</li>
              <li>✅ Unlimited creative freedom</li>
              <li>✅ Invents entirely new game paradigms</li>
              <li>✅ "Experience architecture" approach</li>
              <li>✅ Unprecedented innovation and uniqueness</li>
            </ul>
          </motion.div>
        </div>

        {/* Input Phase */}
        <AnimatePresence mode="wait">
          {currentPhase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <Sparkles className="mr-3 text-yellow-400" />
                  Describe Your Vision
                </h3>
                
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe any game experience you can imagine... The AI will reason about what would make it feel amazing to play!"
                  className="w-full h-32 px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                />

                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3 text-gray-300">Revolutionary Example Prompts:</h4>
                  <div className="grid gap-3">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(example)}
                        className="text-left p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg border border-gray-600 transition-colors text-sm text-gray-300 hover:text-white"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateConceptFirstGame}
                  disabled={!prompt.trim() || isGenerating}
                  className="mt-8 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center text-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Generating Experience...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-3" size={20} />
                      Generate Concept-First Game
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Analysis Phase */}
          {currentPhase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-12">
                <Brain className="mx-auto mb-6 text-blue-400 animate-pulse" size={64} />
                <h3 className="text-3xl font-bold mb-4 text-blue-400">Experience Analysis</h3>
                <p className="text-xl text-gray-300 mb-6">
                  AI is reasoning about what would make "{prompt}" feel amazing to play...
                </p>
                <div className="space-y-3 text-gray-400">
                  <p>🧠 Analyzing emotional core and player journey...</p>
                  <p>🎮 Discovering required interaction systems...</p>
                  <p>✨ Reasoning about emergent gameplay possibilities...</p>
                  <p>🎨 Designing dynamic visual concepts...</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Design Phase */}
          {currentPhase === 'designing' && (
            <motion.div
              key="designing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <Zap className="mx-auto mb-4 text-purple-400 animate-bounce" size={48} />
                  <h3 className="text-2xl font-bold text-purple-400">Dynamic System Generation</h3>
                  <p className="text-gray-300 mt-2">Creating the perfect systems for your vision...</p>
                </div>

                {conceptData.experienceAnalysis && (
                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-3 text-white flex items-center">
                      <Brain className="mr-2 text-blue-400" size={20} />
                      Experience Analysis
                    </h4>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {conceptData.experienceAnalysis.substring(0, 500)}...
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-gray-400">Preparing emergent game engine...</p>
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Playing Phase */}
          {currentPhase === 'playing' && conceptData.experienceAnalysis && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-8">
                <Gamepad2 className="mx-auto mb-4 text-green-400" size={48} />
                <h3 className="text-3xl font-bold text-green-400 mb-2">🎮 Experience Ready!</h3>
                <p className="text-gray-300">
                  Your concept-first game is running! No schemas, no constraints - pure emergent gameplay.
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <EmergentGameEngine
                  conceptAnalysis={conceptData.experienceAnalysis}
                  gameImplementation={conceptData.gameImplementation || ''}
                  userVision={conceptData.userVision || prompt}
                  className="mx-auto"
                />
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="font-bold text-blue-400 mb-2">🌟 Concept-First Features</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Dynamic entity generation from concepts</li>
                    <li>• Emergent visual systems</li>
                    <li>• Adaptive interaction paradigms</li>
                    <li>• Experience-driven progression</li>
                  </ul>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="font-bold text-purple-400 mb-2">🧠 AI Architecture</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Pure conceptual reasoning</li>
                    <li>• No schema constraints</li>
                    <li>• Dynamic system discovery</li>
                    <li>• Emergent complexity</li>
                  </ul>
                </div>
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setCurrentPhase('input')
                    setConceptData({})
                    setPrompt('')
                  }}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center mx-auto"
                >
                  <ArrowRight className="mr-2" size={20} />
                  Try Another Concept
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mt-8"
          >
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <h4 className="font-bold text-red-400 mb-2">Generation Error</h4>
              <p className="text-gray-300">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setCurrentPhase('input')
                }}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ConceptFirstDemo