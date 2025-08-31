'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, Sparkles, Loader, ArrowLeft, Gamepad2, Play, BookOpen, Users, Trophy, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ZambooGuide from '@/components/zamboo/ZambooGuide'
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

  const tutorialMessages = [
    "Hi there! I'm Zamboo! 🐼 Let's create an awesome game together!",
    "Tell me what kind of game you want to make. You can type or use your voice!",
    "Want a game about collecting stars? A maze adventure? A rocket in space? I can make it all!",
    "Don't worry if you're not sure - just describe what sounds fun to you!"
  ]

  const gameTypeDescriptions = {
    collector: 'Collect items like stars, coins, or gems!',
    maze: 'Navigate through puzzles and find the exit!',
    runner: 'Run, jump, and avoid obstacles!',
    puzzle: 'Solve challenges and use your brain!',
    adventure: 'Explore and discover new things!'
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Animated Background Decorations */}
      <BackgroundDecorations />
      {/* Navigation Header */}
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors">
                <ArrowLeft size={20} />
                <span>Back</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="text-3xl">🐼</div>
                <h1 className="logo-text-small">zamboo</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-duo-blue-600 font-medium">
                <Trophy size={20} />
                <span>500</span>
              </div>
              <div className="flex items-center gap-2 text-duo-red-500 font-medium">
                <Heart size={20} />
                <span>5</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex min-h-screen relative z-10">
        {/* Full Height Sidebar - Duolingo Style */}
        <aside className="hidden lg:flex lg:w-60 bg-white border-r border-neutral-200 flex-col">
          <div className="p-4 flex-1">
            <div className="sticky top-6">
              <div className="space-y-1">
                <Link href="/create" className="nav-item active">
                  <div className="nav-icon">
                    🏠
                  </div>
                  <span className="text-sm">CREATE</span>
                </Link>
                
                <Link href="/templates" className="nav-item">
                  <div className="nav-icon">
                    🛡️
                  </div>
                  <span className="text-sm">TEMPLATES</span>
                </Link>
                
                <div className="nav-item">
                  <div className="nav-icon">
                    🏆
                  </div>
                  <span className="text-sm">QUESTS</span>
                </div>
                
                <div className="nav-item">
                  <div className="nav-icon">
                    🛍️
                  </div>
                  <span className="text-sm">SHOP</span>
                </div>
                
                <div className="nav-item">
                  <div className="nav-icon">
                    👤
                  </div>
                  <span className="text-sm">PROFILE</span>
                </div>
                
                <div className="nav-item">
                  <div className="nav-icon">
                    ⋯
                  </div>
                  <span className="text-sm">MORE</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="title-fun mb-2">Create Your Game!</h1>
              <p className="text-lg text-neutral-600">Tell me your game idea and I'll bring it to life! 🎮</p>
            </div>

            {/* Zamboo Guide */}
            <div className="card p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-duo-green-500 rounded-full flex items-center justify-center shadow-medium">
                  <span className="text-3xl">🐼</span>
                </div>
              </div>
              <ZambooGuide
                messages={tutorialMessages}
                initialMood="excited"
                autoAdvance={true}
                advanceDelay={3000}
                size="medium"
                position="center"
                showControls={false}
              />
            </div>

            {/* Game Idea Input */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-neutral-800 mb-6 font-display flex items-center gap-2">
                <Sparkles className="text-duo-blue-500" />
                What's Your Game Idea?
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your game idea here... like 'a panda collecting bamboo in a magical forest' or 'a rocket flying through space collecting gems'!"
                    className="textarea"
                    disabled={isGenerating}
                  />
                  
                  <button
                    onClick={startListening}
                    disabled={isGenerating}
                    className={`absolute bottom-4 right-4 p-3 rounded-xl shadow-medium transition-all ${
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
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-duo-red-500 rounded-full animate-pulse"></div>
                      <span>🎤 Listening... speak your game idea!</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Game Settings */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-neutral-800 mb-6 font-display">Game Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as any)}
                    className="input"
                    disabled={isGenerating}
                  >
                    <option value="5-7">5-7 years (Simple & Fun)</option>
                    <option value="8-10">8-10 years (Learning Focus)</option>
                    <option value="11-13">11-13 years (More Challenge)</option>
                    <option value="14+">14+ years (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Game Type</label>
                  <select
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value as any)}
                    className="input"
                    disabled={isGenerating}
                  >
                    <option value="collector">Collector Game</option>
                    <option value="maze">Maze Adventure</option>
                    <option value="runner">Runner Game</option>
                    <option value="puzzle">Puzzle Game</option>
                    <option value="adventure">Adventure Game</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-2">
                    {gameTypeDescriptions[gameType]}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">Complexity</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['simple', 'medium', 'complex'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setComplexity(level as any)}
                        className={`p-4 rounded-xl border-2 font-medium transition-all text-center ${
                          complexity === level
                            ? 'border-duo-green-500 bg-duo-green-500 text-white shadow-medium'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-duo-green-300 hover:bg-duo-green-50'
                        }`}
                        disabled={isGenerating}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
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
              className={`w-full btn-success text-xl py-4 flex items-center justify-center gap-3 ${
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

            {/* Quick Examples */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-neutral-800 mb-4 font-display">Need Ideas? Try These!</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "A panda collecting bamboo in a forest",
                  "A rocket ship flying through space",
                  "A cat jumping on platforms",
                  "A treasure hunter in a maze"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="btn-ghost text-left p-4 text-sm hover:text-duo-blue-600"
                    disabled={isGenerating}
                  >
                    💡 {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card p-6 border-l-4 border-duo-red-500"
              >
                <div className="flex items-start gap-3">
                  <div className="text-duo-red-500 text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-duo-red-800 mb-1">Oops!</h4>
                    <p className="text-duo-red-600 text-sm mb-3">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="btn-ghost text-xs py-1 px-3"
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
                className="card p-6 text-center bg-gradient-to-br from-duo-green-50 to-duo-green-100 border-l-4 border-duo-green-500"
              >
                <div className="text-4xl mb-4 success-bounce">🎉</div>
                <h4 className="font-bold text-duo-green-800 text-xl mb-2 font-display">Game Created!</h4>
                <p className="text-duo-green-600 mb-4">
                  Your game "{generatedGame.title}" is ready to play!
                </p>
                <div className="flex items-center justify-center gap-2 text-duo-green-700 animate-pulse">
                  <Play size={16} />
                  <span className="text-sm font-medium">Starting game...</span>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateGamePage