'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Save, Trash2, Clock, Calendar, Gamepad2, Trophy, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ZambooMascot from '@/components/zamboo/ZambooMascot'
import BackgroundDecorations from '@/components/ui/BackgroundDecorations'
import Sidebar from '@/components/ui/Sidebar'
import type { GameLogic, ZambooState } from '@/types'

interface SavedGame {
  id: string
  title: string
  type?: string
  html?: string
  savedAt: string
  stats?: {
    gamesPlayed: number
    totalScore: number
    bestScore: number
  }
  blockWorkspace?: any[]
}

const SavedGamesPage: React.FC = () => {
  const router = useRouter()
  const [savedGames, setSavedGames] = useState<SavedGame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [zambooState, setZambooState] = useState<ZambooState>({
    mood: 'happy',
    animation: 'idle'
  })

  useEffect(() => {
    // Load saved games from localStorage
    const games = JSON.parse(localStorage.getItem("savedGames") || "[]")
    setSavedGames(games)
    
    if (games.length === 0) {
      setZambooState({ mood: 'thinking', animation: 'idle' })
    }
  }, [])

  const handlePlayGame = async (game: SavedGame) => {
    setIsLoading(true)
    setZambooState({ mood: 'excited', animation: 'dance' })

    try {
      localStorage.setItem('currentGame', JSON.stringify(game))
      router.push('/game')
    } catch (error) {
      console.error('Error loading saved game:', error)
      setZambooState({ mood: 'encouraging', animation: 'thinking' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteGame = (gameId: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      const updatedGames = savedGames.filter(game => game.id !== gameId)
      setSavedGames(updatedGames)
      localStorage.setItem("savedGames", JSON.stringify(updatedGames))
      setZambooState({ mood: 'happy', animation: 'clap' })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGameTypeIcon = (game: SavedGame) => {
    if (game.type === 'html') return '🌐'
    if (game.blockWorkspace && game.blockWorkspace.length > 0) return '🧩'
    return '🎮'
  }

  const getGameTypeLabel = (game: SavedGame) => {
    if (game.type === 'html') return 'HTML Game'
    if (game.blockWorkspace && game.blockWorkspace.length > 0) return 'Block Game'
    return 'Standard Game'
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative flex flex-col">
      <BackgroundDecorations />
      
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10 flex-shrink-0">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors">
                <ArrowLeft size={18} />
                <span>Back</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-panda-bounce cursor-pointer">🐼</div>
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

      <div className="flex flex-1 relative z-10 min-h-0">
        {/* Expandable Sidebar */}
        <Sidebar 
          navItems={[
            { href: "/create", icon: "🏠", label: "CREATE" },
            { href: "/savedgames", icon: "💾", label: "SAVED GAMES", isActive: true },
            { href: "/quests", icon: "🏆", label: "QUESTS" },
            { href: "/leaderboard", icon: "📊", label: "LEADERBOARD" },
            { href: "/profile", icon: "👤", label: "PROFILE" },
            { href: "/more", icon: "⋯", label: "MORE" }
          ]}
        />

        <main className="flex-1 px-4 py-1 flex flex-col justify-between">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-3">
              <h1 className="text-2xl font-bold text-neutral-800 mb-2 font-display">Your Saved Games!</h1>
              <p className="text-sm text-neutral-600">Continue playing your saved games anytime! 💾</p>
            </div>

            <div className="card p-4 mb-3">
              <div className="flex items-center justify-center mb-2">
                <ZambooMascot 
                  size="medium"
                  state={zambooState}
                  interactive={true}
                  showSpeechBubble={true}
                  message={savedGames.length > 0 
                    ? `You have ${savedGames.length} saved game${savedGames.length !== 1 ? 's' : ''}! Click any to continue playing! 🎮`
                    : "No saved games yet! Create and save games from the game view to see them here! 🎨"
                  }
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-700 mb-2">
                  {savedGames.length > 0 
                    ? "Pick any saved game below to continue where you left off!"
                    : "Start creating games and save them to build your collection!"
                  }
                </p>
                <p className="text-sm text-neutral-600">
                  {savedGames.length > 0 
                    ? "Your progress and block arrangements are preserved! 🚀"
                    : "Click 'Save' in any game to add it to your collection! ⭐"
                  }
                </p>
              </div>
            </div>

            {savedGames.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="text-6xl mb-4">📁</div>
                <h2 className="text-2xl font-bold text-neutral-700 mb-2">No Saved Games Yet</h2>
                <p className="text-neutral-600 mb-6">
                  Create awesome games and save them to see them here!
                </p>
                <Link 
                  href="/create"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Gamepad2 size={18} />
                  Start Creating Games
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedGames.map((game) => (
                  <motion.div
                    key={game.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="card-interactive p-6 flex flex-col min-h-[320px] relative group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getGameTypeIcon(game)}</span>
                        <span className="text-sm font-medium text-neutral-600">
                          {getGameTypeLabel(game)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteGame(game.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1 rounded"
                        title="Delete game"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-bold text-neutral-800 mb-3 font-display line-clamp-2">
                      {game.title || 'Untitled Game'}
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(game.savedAt)}</span>
                      </div>
                    </div>

                    {game.stats && (
                      <div className="mb-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Games Played:</span>
                          <span className="font-medium">{game.stats.gamesPlayed || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Best Score:</span>
                          <span className="font-medium text-duo-green-600">{game.stats.bestScore || 0}</span>
                        </div>
                      </div>
                    )}

                    {game.blockWorkspace && game.blockWorkspace.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-neutral-500 mb-1">Block Workspace:</div>
                        <div className="text-sm text-duo-purple-600 font-medium">
                          {game.blockWorkspace.length} block{game.blockWorkspace.length !== 1 ? 's' : ''} saved
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handlePlayGame(game)}
                      disabled={isLoading}
                      className="w-full btn-success flex items-center justify-center gap-2 mt-auto"
                    >
                      <Play size={16} />
                      Continue Playing
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SavedGamesPage