'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Star, Clock, Users, Sparkles, Gamepad2, BookOpen, Trophy, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ZambooMascot from '@/components/zamboo/ZambooMascot'
import BackgroundDecorations from '@/components/ui/BackgroundDecorations'
import GameGenerator from '@/lib/gameGenerator'
import type { GameTemplate, ZambooState } from '@/types'

const TemplatesPage: React.FC = () => {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [zambooState, setZambooState] = useState<ZambooState>({
    mood: 'happy',
    animation: 'idle'
  })

  const templates = GameGenerator.getAvailableTemplates()
  const featuredTemplates = templates.filter(t => t.featured)
  const allTemplates = templates

  const handlePlayTemplate = async (template: GameTemplate) => {
    setIsLoading(true)
    setZambooState({ mood: 'excited', animation: 'dance' })

    try {
      const gameLogic = GameGenerator.createTemplateGame(template.id)
      localStorage.setItem('currentGame', JSON.stringify(gameLogic))
      router.push('/game')
    } catch (error) {
      console.error('Error loading template:', error)
      setZambooState({ mood: 'encouraging', animation: 'thinking' })
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-duo-green-600 bg-duo-green-100'
      case 'medium': return 'text-duo-yellow-600 bg-duo-yellow-100'
      case 'hard': return 'text-duo-red-600 bg-duo-red-100'
      default: return 'text-neutral-600 bg-neutral-100'
    }
  }

  const getConceptColor = (concept: string) => {
    switch (concept) {
      case 'loops': return 'bg-duo-blue-500 text-white'
      case 'conditions': return 'bg-duo-purple-500 text-white'
      case 'events': return 'bg-duo-green-500 text-white'
      case 'physics': return 'bg-duo-yellow-500 text-white'
      case 'logic': return 'bg-duo-red-500 text-white'
      default: return 'bg-neutral-500 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      <BackgroundDecorations />
      
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

      <div className="flex min-h-screen relative z-10">
        <aside className="hidden lg:flex lg:w-60 bg-white border-r border-neutral-200 flex-col">
          <div className="p-4 flex-1">
            <div className="sticky top-6">
              <div className="space-y-1">
                <Link href="/create" className="nav-item">
                  <div className="nav-icon">
                    🏠
                  </div>
                  <span className="text-sm">CREATE</span>
                </Link>
                
                <Link href="/templates" className="nav-item active">
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
                    📊
                  </div>
                  <span className="text-sm">LEADERBOARD</span>
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

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="title-fun mb-2">Game Templates!</h1>
              <p className="text-lg text-neutral-600">Choose a template and start playing instantly! 🎮</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-center mb-4">
                <ZambooMascot 
                  size="large"
                  state={{ mood: 'happy', animation: 'idle' }}
                  interactive={true}
                  showSpeechBubble={true}
                  message="Choose any template and let's start playing! 🎮"
                />
              </div>
              <div className="text-center">
                <p className="text-lg text-neutral-700 mb-2">
                  Pick any game template below and start playing right away!
                </p>
                <p className="text-neutral-600">
                  Each game teaches different coding concepts while having fun! 🚀
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card-interactive p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="text-duo-yellow-500" size={20} />
                    <span className="text-sm font-bold text-duo-yellow-600">FEATURED</span>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-duo-green-100 text-duo-green-600">
                    Easy
                  </span>
                </div>
                
                <h3 className="title-small mb-2">Star Collector</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Help the panda collect stars while avoiding obstacles! Learn about movement and collision detection.
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-duo-green-500 text-white">events</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-duo-yellow-500 text-white">physics</span>
                </div>
                
                <button
                  onClick={() => {/* handle play */}}
                  className="w-full btn-success flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Play Now
                </button>
              </div>

              <div className="card-interactive p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="text-neutral-400" size={20} />
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-duo-yellow-100 text-duo-yellow-600">
                    Medium
                  </span>
                </div>
                
                <h3 className="title-small mb-2">Maze Runner</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Navigate through mazes using arrow keys! Learn about conditions and logic.
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-duo-purple-500 text-white">conditions</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-duo-red-500 text-white">logic</span>
                </div>
                
                <button
                  onClick={() => {/* handle play */}}
                  className="w-full btn-success flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Play Now
                </button>
              </div>

              <div className="card-interactive p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="text-neutral-400" size={20} />
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-duo-green-100 text-duo-green-600">
                    Easy
                  </span>
                </div>
                
                <h3 className="title-small mb-2">Jumping Panda</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Make the panda jump over obstacles! Learn about loops and timing.
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  <span className="px-2 py-1 rounded-full text-xs bg-duo-blue-500 text-white">loops</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-duo-green-500 text-white">events</span>
                </div>
                
                <button
                  onClick={() => {/* handle play */}}
                  className="w-full btn-success flex items-center justify-center gap-2"
                >
                  <Play size={16} />
                  Play Now
                </button>
              </div>
            </div>

            <div className="card p-6 text-center">
              <h3 className="text-xl font-bold text-neutral-800 mb-4">More Templates Coming Soon!</h3>
              <p className="text-neutral-600 mb-4">
                We're working on adding more exciting game templates for you to explore.
              </p>
              <Link href="/create" className="btn-ghost inline-flex items-center gap-2">
                <Sparkles size={16} />
                Create Custom Game Instead
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TemplatesPage