'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Star, Clock, Users, Sparkles, Gamepad2, BookOpen, Trophy, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ZambooMascot from '@/components/zamboo/ZambooMascot'
import BackgroundDecorations from '@/components/ui/BackgroundDecorations'
import Sidebar from '@/components/ui/Sidebar'
import GameGenerator from '@/lib/gameGenerator'
import type { GameTemplateInfo, ZambooState } from '@/types'

const TemplatesPage: React.FC = () => {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplateInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [zambooState, setZambooState] = useState<ZambooState>({
    mood: 'happy',
    animation: 'idle'
  })

  const templates = GameGenerator.getAvailableTemplates()
  const featuredTemplates = templates.filter(t => t.featured)
  const allTemplates = templates

  const handlePlayTemplate = async (template: GameTemplateInfo) => {
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
    <div className="min-h-screen bg-neutral-50 relative flex flex-col">
      <BackgroundDecorations />
      
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10 flex-shrink-0">
        <div className="w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-1 sm:gap-2 text-neutral-600 hover:text-neutral-800 transition-colors">
                <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline text-sm">Back</span>
              </Link>
              
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0">
                <div className="text-2xl sm:text-3xl lg:text-4xl animate-panda-bounce cursor-pointer">🐼</div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-duo-green-500 font-display truncate">zamboo</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 text-duo-blue-600 font-medium">
                <Trophy size={14} className="sm:w-[16px] sm:h-[16px] lg:w-[18px] lg:h-[18px]" />
                <span className="text-sm sm:text-base">500</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-duo-red-500 font-medium">
                <Heart size={14} className="sm:w-[16px] sm:h-[16px] lg:w-[18px] lg:h-[18px]" />
                <span className="text-sm sm:text-base">5</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 relative z-10 min-h-0">
        {/* Expandable Sidebar */}
        <Sidebar 
          navItems={[
            { href: "/create", icon: "🏠", label: "CREATE" },
            { href: "/savedgames", icon: "💾", label: "SAVED GAMES" },
            { href: "/quests", icon: "🏆", label: "QUESTS" },
            { href: "/leaderboard", icon: "📊", label: "LEADERBOARD" },
            { href: "/profile", icon: "👤", label: "PROFILE" },
            { href: "/more", icon: "⋯", label: "MORE" }
          ]}
        />

        <main className="flex-1 px-2 sm:px-4 py-1 flex flex-col justify-between">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-2 sm:mb-3">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800 mb-1 sm:mb-2 font-display">Game Templates!</h1>
              <p className="text-xs sm:text-sm text-neutral-600">Choose a template and start playing instantly! 🎮</p>
            </div>

            <div className="card p-2 sm:p-3 lg:p-4 mb-2 sm:mb-3">
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <ZambooMascot 
                  size="small"
                  state={{ mood: 'happy', animation: 'idle' }}
                  interactive={true}
                  showSpeechBubble={true}
                  message="Choose any template and let's start playing! 🎮"
                />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-neutral-700 mb-1 sm:mb-2 leading-tight">
                  Pick any game template below and start playing right away!
                </p>
                <p className="text-xs sm:text-sm text-neutral-600 leading-tight">
                  Each game teaches different coding concepts while having fun! 🚀
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <div className="card-interactive p-3 sm:p-4 lg:p-6 flex flex-col min-h-[280px] sm:min-h-[300px]">
                <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Star className="text-duo-yellow-500" size={16} />
                    <span className="text-xs sm:text-sm lg:text-base font-bold text-duo-yellow-600">FEATURED</span>
                  </div>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-duo-green-100 text-duo-green-600">
                    Easy
                  </span>
                </div>
                
                <h3 className="text-base sm:text-lg font-bold text-neutral-800 mb-2 sm:mb-3 font-display">Star Collector</h3>
                <p className="text-xs sm:text-sm text-neutral-600 mb-3 sm:mb-4 leading-tight">
                  Help the panda collect stars while avoiding obstacles! Learn about movement and collision detection.
                </p>
                
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-duo-green-500 text-white">events</span>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-duo-yellow-500 text-white">physics</span>
                </div>
                
                <button
                  onClick={() => {/* handle play */}}
                  className="w-full btn-success flex items-center justify-center gap-2 mt-auto text-sm sm:text-base py-2 sm:py-3"
                >
                  <Play size={14} className="sm:w-[16px] sm:h-[16px]" />
                  Play Now
                </button>
              </div>

              <div className="card-interactive p-3 sm:p-4 lg:p-6 flex flex-col min-h-[280px] sm:min-h-[300px]">
                <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Clock className="text-neutral-400" size={16} />
                  </div>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-duo-yellow-100 text-duo-yellow-600">
                    Medium
                  </span>
                </div>
                
                <h3 className="text-base sm:text-lg font-bold text-neutral-800 mb-2 sm:mb-3 font-display">Maze Runner</h3>
                <p className="text-xs sm:text-sm text-neutral-600 mb-3 sm:mb-4 leading-tight">
                  Navigate through mazes using arrow keys! Learn about conditions and logic.
                </p>
                
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-duo-purple-500 text-white">conditions</span>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-duo-red-500 text-white">logic</span>
                </div>
                
                <button
                  onClick={() => {/* handle play */}}
                  className="w-full btn-success flex items-center justify-center gap-2 mt-auto text-sm sm:text-base py-2 sm:py-3"
                >
                  <Play size={14} className="sm:w-[16px] sm:h-[16px]" />
                  Play Now
                </button>
              </div>

              <div className="card-interactive p-3 sm:p-4 lg:p-6 flex flex-col min-h-[280px] sm:min-h-[300px]">
                <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Clock className="text-neutral-400" size={16} />
                  </div>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-duo-green-100 text-duo-green-600">
                    Easy
                  </span>
                </div>
                
                <h3 className="text-base sm:text-lg font-bold text-neutral-800 mb-2 sm:mb-3 font-display">Jumping Panda</h3>
                <p className="text-xs sm:text-sm text-neutral-600 mb-3 sm:mb-4 leading-tight">
                  Make the panda jump over obstacles! Learn about loops and timing.
                </p>
                
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-duo-blue-500 text-white">loops</span>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-duo-green-500 text-white">events</span>
                </div>
                
                <button
                  onClick={() => {/* handle play */}}
                  className="w-full btn-success flex items-center justify-center gap-2 mt-auto text-sm sm:text-base py-2 sm:py-3"
                >
                  <Play size={14} className="sm:w-[16px] sm:h-[16px]" />
                  Play Now
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default TemplatesPage