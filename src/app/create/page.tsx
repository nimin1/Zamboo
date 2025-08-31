'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, Sparkles, Loader, ArrowLeft, Gamepad2, Play, BookOpen, Users, Trophy, Heart, MessageCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ZambooMascot from '@/components/zamboo/ZambooMascot'
import BackgroundDecorations from '@/components/ui/BackgroundDecorations'
import GameGenerator from '@/lib/gameGenerator'
import type { DeepSeekRequest, GameLogic, ZambooState } from '@/types'

const CreateGamePage: React.FC = () => {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [ageGroup, setAgeGroup] = useState<'5-7' | '8-10' | '11-13' | '14+'>('8-10')
  const [gameType, setGameType] = useState<'collector' | 'maze' | 'runner' | 'puzzle' | 'adventure'>('collector')
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'complex'>('simple')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedGame, setGeneratedGame] = useState<GameLogic | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)

  const handleGenerateGame = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please describe your game idea first!')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const request: DeepSeekRequest = {
        prompt: prompt.trim(),
        kidAgeBand: ageGroup,
        complexity,
        gameType
      }

      const response = await GameGenerator.generateGame(request)

      if (response.success && response.gameLogic) {
        setGeneratedGame(response.gameLogic)
        
        setTimeout(() => {
          localStorage.setItem('currentGame', JSON.stringify(response.gameLogic))
          router.push('/game')
        }, 2000)
      } else {
        setError(response.error || 'Failed to generate game')
      }
    } catch (err) {
      setError('Something went wrong. Please try again!')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, ageGroup, complexity, gameType, router])

  const startListening = useCallback(() => {
    // Voice recognition placeholder
    setIsListening(true)
    setTimeout(() => setIsListening(false), 3000)
  }, [])

  const helpfulTips = [
    "Don't worry if you're not sure - just describe what sounds fun to you!",
    "You can say 'a panda collecting bamboo' or 'a rocket flying through space'!",
    "Try thinking about your favorite animals, places, or activities!",
    "Want to make a maze? A racing game? A puzzle? I can help with any idea!",
    "Remember: there are no wrong answers - just fun games waiting to be made! 🎮"
  ]

  const gameTypeDescriptions = {
    collector: 'Collect items like stars, coins, or gems!',
    maze: 'Navigate through puzzles and find the exit!',
    runner: 'Run, jump, and avoid obstacles!',
    puzzle: 'Solve challenges and use your brain!',
    adventure: 'Explore and discover new things!'
  }

  // Auto-rotate tips every 5 seconds when chat is open
  useEffect(() => {
    if (showChat) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % helpfulTips.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [showChat, helpfulTips.length])

  return (
    <div className="h-screen bg-neutral-50 relative flex flex-col">
      {/* Animated Background Decorations */}
      <BackgroundDecorations />
      
      {/* Navigation Header */}
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10 flex-shrink-0">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors">
                <ArrowLeft size={18} />
                <span>Back</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="text-4xl animate-panda-bounce cursor-pointer">🐼</div>
                <h1 className="logo-text-small">zamboo</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-duo-blue-600 font-medium">
                <Trophy size={18} />
                <span>500</span>
              </div>
              <div className="flex items-center gap-2 text-duo-red-500 font-medium">
                <Heart size={18} />
                <span>5</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 relative z-10 min-h-0">
        {/* Full Height Sidebar - Duolingo Style */}
        <aside className="hidden lg:flex lg:w-64 bg-white border-r border-neutral-200 flex-col">
          <div className="p-4 flex-1">
            <div className="sticky top-6">
              <div className="space-y-1">
                <Link href="/create" className="nav-item active">
                  <div className="nav-icon">
                    🏠
                  </div>
                  <span>CREATE</span>
                </Link>
                
                <Link href="/templates" className="nav-item">
                  <div className="nav-icon">
                    🛡️
                  </div>
                  <span>TEMPLATES</span>
                </Link>
                
                <div className="nav-item">
                  <div className="nav-icon">
                    🏆
                  </div>
                  <span>QUESTS</span>
                </div>
                
                <div className="nav-item">
                  <div className="nav-icon">
                    📊
                  </div>
                  <span>LEADERBOARD</span>
                </div>
                
                <div className="nav-item">
                  <div className="nav-icon">
                    👤
                  </div>
                  <span>PROFILE</span>
                </div>
                
                <div className="nav-item">
                  <div className="nav-icon">
                    ⋯
                  </div>
                  <span>MORE</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-3 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2 font-display">Create Your Game!</h1>
              <p className="text-base text-neutral-600">Tell me your game idea and I'll bring it to life! 🎮</p>
            </div>

            {/* Main Game Idea Section */}
            <div className="card p-6 mb-4 flex-1">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4 font-display flex items-center gap-3">
                <Sparkles className="text-duo-blue-500" size={28} />
                What's Your Game Idea?
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your game idea here... like 'a panda collecting bamboo in a magical forest'!"
                    className="w-full px-4 py-4 border-2 border-neutral-200 rounded-xl focus:border-duo-blue-500 focus:ring-2 focus:ring-duo-blue-100 outline-none transition-all duration-200 text-lg min-h-[200px] resize-none"
                    disabled={isGenerating}
                  />
                  
                  <button
                    onClick={startListening}
                    disabled={isGenerating}
                    className={`absolute bottom-3 right-3 p-3 rounded-xl shadow-medium transition-all ${
                      isListening 
                        ? 'bg-duo-red-500 hover:bg-duo-red-600 text-white' 
                        : 'bg-duo-blue-500 hover:bg-duo-blue-600 text-white'
                    } disabled:opacity-50`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                </div>

                {isListening && (
                  <motion.div
                    className="text-center text-duo-blue-600 font-medium py-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-3 h-3 bg-duo-red-500 rounded-full animate-pulse"></div>
                      <span className="text-base">🎤 Listening... speak your game idea!</span>
                    </div>
                  </motion.div>
                )}

                {/* Game Settings - Compact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Age Group</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value as any)}
                      className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-duo-blue-500 focus:ring-2 focus:ring-duo-blue-100 outline-none transition-all text-sm"
                      disabled={isGenerating}
                    >
                      <option value="5-7">5-7 years</option>
                      <option value="8-10">8-10 years</option>
                      <option value="11-13">11-13 years</option>
                      <option value="14+">14+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Game Type</label>
                    <select
                      value={gameType}
                      onChange={(e) => setGameType(e.target.value as any)}
                      className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:border-duo-blue-500 focus:ring-2 focus:ring-duo-blue-100 outline-none transition-all text-sm"
                      disabled={isGenerating}
                    >
                      <option value="collector">Collector</option>
                      <option value="maze">Maze</option>
                      <option value="runner">Runner</option>
                      <option value="puzzle">Puzzle</option>
                      <option value="adventure">Adventure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Complexity</label>
                    <div className="grid grid-cols-3 gap-1">
                      {['simple', 'medium', 'complex'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setComplexity(level as any)}
                          className={`py-2 rounded-lg border-2 font-medium transition-all text-center text-xs ${
                            complexity === level
                              ? 'border-duo-green-500 bg-duo-green-500 text-white'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-duo-green-300'
                          }`}
                          disabled={isGenerating}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Examples moved to bottom */}
                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-neutral-800 mb-3 font-display">Need Ideas? Try These!</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "A panda collecting bamboo in a forest",
                      "A rocket ship flying through space",
                      "A cat jumping on platforms",
                      "A treasure hunter in a maze"
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(example)}
                        className="btn-ghost text-left p-3 text-sm hover:text-duo-blue-600 transition-colors"
                        disabled={isGenerating}
                      >
                        💡 {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateGame}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full btn-success text-lg py-4 flex items-center justify-center gap-3 ${
                isGenerating ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Creating Your Game...
                </>
              ) : (
                <>
                  <Play size={24} />
                  Create My Game!
                </>
              )}
            </button>

            {/* Status Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card p-4 border-l-4 border-duo-red-500 mt-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-duo-red-500 text-2xl">⚠️</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-duo-red-800 text-base mb-1">Oops!</h4>
                      <p className="text-duo-red-600 text-sm mb-3">{error}</p>
                      <button
                        onClick={() => setError(null)}
                        className="btn-ghost text-sm py-2 px-3"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {generatedGame && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="card p-6 text-center bg-gradient-to-br from-duo-green-50 to-duo-green-100 border-l-4 border-duo-green-500 mt-4"
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <h4 className="font-bold text-duo-green-800 text-xl mb-2 font-display">Game Created!</h4>
                  <p className="text-duo-green-600 mb-3 text-base">
                    Your game "{generatedGame.title}" is ready to play!
                  </p>
                  <div className="flex items-center justify-center gap-3 text-duo-green-700 animate-pulse">
                    <Play size={18} />
                    <span className="text-sm font-medium">Starting game...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-strong border border-neutral-200 p-4 mb-2"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-duo-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🐼</span>
                  </div>
                  <span className="font-bold text-neutral-800 text-sm">Zamboo's Tips</span>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <motion.div
                key={currentTipIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-neutral-700 text-sm leading-relaxed"
              >
                {helpfulTips[currentTipIndex]}
              </motion.div>
              
              <div className="flex justify-center mt-3 gap-1">
                {helpfulTips.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTipIndex ? 'bg-duo-green-500' : 'bg-neutral-200'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 bg-duo-green-500 hover:bg-duo-green-600 text-white rounded-full shadow-strong flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={showChat ? {} : { 
            y: [0, -4, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={showChat ? {} : {
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          {showChat ? <X size={24} /> : <MessageCircle size={24} />}
        </motion.button>
      </div>
    </div>
  )
}

export default CreateGamePage