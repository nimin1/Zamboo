'use client'

import Link from 'next/link'
import { Gamepad2, Sparkles, Code, Heart, Play, BookOpen, Users, Trophy } from 'lucide-react'
import BackgroundDecorations from '@/components/ui/BackgroundDecorations'
import ZambooMascot from '@/components/zamboo/ZambooMascot'

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Animated Background Decorations */}
      <BackgroundDecorations />
      {/* Navigation Header */}
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🐼</div>
              <h1 className="logo-text-medium">zamboo</h1>
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

        {/* Main Content Area */}
        <main className="flex-1 px-6 py-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="card p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <ZambooMascot 
                  size="xl"
                  state={{ mood: 'happy', animation: 'idle' }}
                  interactive={true}
                  showSpeechBubble={true}
                  message="Hi there! Ready for a coding adventure? 🚀"
                />
              </div>
              
              <h1 className="title-fun mb-4">
                Learn to Code with Games!
              </h1>
              
              <p className="body-large mb-6 max-w-2xl mx-auto">
                I'm Zamboo, your coding companion! Let's create amazing games together and learn programming concepts through play.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create" className="btn-success inline-flex items-center gap-3 justify-center">
                  <Play size={24} />
                  Start Creating Games
                </Link>
                
                <Link href="/templates" className="btn-ghost inline-flex items-center gap-3 justify-center">
                  <Sparkles size={20} />
                  Try Templates
                </Link>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-interactive p-6 text-center">
                <div className="w-16 h-16 bg-duo-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="text-duo-green-600" size={28} />
                </div>
                <h3 className="title-small mb-2">Play & Create</h3>
                <p className="body-medium">Speak or type your game ideas and watch them come to life instantly!</p>
              </div>
              
              <div className="card-interactive p-6 text-center">
                <div className="w-16 h-16 bg-duo-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code className="text-duo-blue-600" size={28} />
                </div>
                <h3 className="title-small mb-2">Learn Coding</h3>
                <p className="body-medium">Discover loops, events, and conditions through fun interactive gameplay!</p>
              </div>
              
              <div className="card-interactive p-6 text-center">
                <div className="w-16 h-16 bg-duo-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-duo-purple-600" size={28} />
                </div>
                <h3 className="title-small mb-2">Edit & Experiment</h3>
                <p className="body-medium">Use visual blocks to modify games and see changes in real-time!</p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="card p-6">
              <h2 className="title-medium mb-6">Your Coding Journey</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-duo-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <span className="font-medium text-neutral-700">Create your first game</span>
                  </div>
                  <div className="text-duo-green-600 font-bold">✓</div>
                </div>
                
                <div className="flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                      <span className="text-neutral-500 font-bold text-sm">2</span>
                    </div>
                    <span className="font-medium text-neutral-500">Try all template games</span>
                  </div>
                  <div className="text-neutral-400">0 / 4</div>
                </div>
                
                <div className="flex items-center justify-between opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
                      <span className="text-neutral-500 font-bold text-sm">3</span>
                    </div>
                    <span className="font-medium text-neutral-500">Edit a game with blocks</span>
                  </div>
                  <div className="text-neutral-400">Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Zamboo Floating Assistant */}
      <div className="fixed bottom-6 right-6 z-20">
        <ZambooMascot 
          size="medium"
          state={{ mood: 'excited', animation: 'idle' }}
          interactive={true}
          showSpeechBubble={true}
          message="Click 'Start Creating' to make your first game! 🎮"
        />
      </div>
    </div>
  )
}