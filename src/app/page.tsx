"use client";

import Link from "next/link";
import {
  Gamepad2,
  Sparkles,
  Code,
  Heart,
  Play,
  BookOpen,
  Users,
  Trophy,
} from "lucide-react";
import BackgroundDecorations from "@/components/ui/BackgroundDecorations";
import ZambooMascot from "@/components/zamboo/ZambooMascot";
import Sidebar from "@/components/ui/Sidebar";

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col font-sans" style={{backgroundColor: '#F7FBFC'}}>
      {/* Animated Background Decorations */}
      <BackgroundDecorations />
      {/* Navigation Header */}
      <nav className="bg-white relative z-10 flex-shrink-0" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', borderBottom: '1px solid #E6E6E6'}}>
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative panda-logo-special group">
                <div className="text-4xl animate-panda-eating cursor-pointer panda-icon transition-all duration-300 hover:scale-110">
                  🐼
                </div>
                <div className="absolute -right-2 top-1 text-lg animate-bamboo-appear bamboo-stick">
                  🎋
                </div>
                <div className="absolute -top-1 -right-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  ✨
                </div>
                <div className="absolute -bottom-1 -left-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  💫
                </div>
              </div>
              <h1 className="text-xl font-bold font-sans" style={{color: '#148AFF'}}>zamboo</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 font-semibold" style={{color: '#148AFF'}}>
                <Trophy size={18} />
                <span>500</span>
              </div>
              <div className="flex items-center gap-2 font-semibold" style={{color: '#F6C83B'}}>
                <Heart size={18} />
                <span>5</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 relative z-10 min-h-0">
        {/* Expandable Sidebar */}
        <Sidebar
          navItems={[
            { href: "/create", icon: "🏠", label: "CREATE", isActive: true },
            { href: "/savedgames", icon: "💾", label: "SAVED GAMES" },
            { href: "/quests", icon: "🏆", label: "QUESTS" },
            { href: "/leaderboard", icon: "📊", label: "LEADERBOARD" },
            { href: "/profile", icon: "👤", label: "PROFILE" },
            { href: "/more", icon: "⋯", label: "MORE" },
          ]}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-6 py-8 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full flex flex-col justify-between">
            {/* Hero Section */}
            <div className="card text-center mb-8">
              <div className="flex items-center justify-center mb-3">
                <ZambooMascot
                  size="medium"
                  state={{ mood: "happy", animation: "idle" }}
                  interactive={true}
                  showSpeechBubble={true}
                  message="Hi There! Ready for a vibe coding adventure? 🚀"
                />
              </div>

              <h1 className="text-2xl md:text-4xl font-bold mb-4 font-sans leading-tight" style={{color: '#1A1A1A'}}>
                Learn to Code with Games!
              </h1>

              <p className="text-base md:text-lg mb-6 max-w-2xl mx-auto font-sans" style={{color: '#666666'}}>
                I'm Zamboo, your coding companion! Let's create amazing
                games together and learn while we play.
              </p>

              <div className="flex justify-center">
                <Link
                  href="/create"
                  className="btn-success inline-flex items-center gap-2 justify-center text-sm md:text-base py-2 md:py-3 px-4 md:px-6"
                >
                  <Play size={16} className="md:hidden" />
                  <Play size={18} className="hidden md:block" />
                  Start Creating Games
                </Link>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {/* Feature Cards - Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card-interactive text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#E5F0F3'}}>
                    <Gamepad2 style={{color: '#148AFF'}} size={28} />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 font-sans" style={{color: '#1A1A1A'}}>
                    Play & Create
                  </h3>
                  <p className="text-base leading-relaxed font-sans" style={{color: '#666666'}}>
                    Speak or type your game ideas and watch them come to life!
                  </p>
                </div>

                <div className="card-interactive text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#E5F0F3'}}>
                    <Code style={{color: '#148AFF'}} size={28} />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 font-sans" style={{color: '#1A1A1A'}}>
                    Learn Coding
                  </h3>
                  <p className="text-base leading-relaxed font-sans" style={{color: '#666666'}}>
                    Discover loops, events, and conditions through gameplay!
                  </p>
                </div>

                <div className="card-interactive text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#FEF7E6'}}>
                    <Sparkles style={{color: '#F6C83B'}} size={28} />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 font-sans" style={{color: '#1A1A1A'}}>
                    Edit & Experiment
                  </h3>
                  <p className="text-base leading-relaxed font-sans" style={{color: '#666666'}}>
                    Use visual blocks to modify games in real-time!
                  </p>
                </div>
              </div>

              {/* Progress Section */}
              <div className="card overflow-hidden">
                <h2 className="text-xl font-semibold mb-4 font-sans" style={{color: '#1A1A1A'}}>
                  Your Coding Journey
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#148AFF'}}>
                        <span className="text-white font-semibold text-sm">1</span>
                      </div>
                      <span className="font-medium font-sans" style={{color: '#1A1A1A'}}>
                        Create your first game
                      </span>
                    </div>
                    <div className="font-semibold" style={{color: '#148AFF'}}>
                      ✓
                    </div>
                  </div>

                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#E0E0E0'}}>
                        <span className="font-semibold text-sm" style={{color: '#999999'}}>
                          2
                        </span>
                      </div>
                      <span className="font-medium font-sans" style={{color: '#999999'}}>
                        Edit a game with prompts
                      </span>
                    </div>
                    <div className="text-sm" style={{color: '#999999'}}>0 / 4</div>
                  </div>

                  <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{backgroundColor: '#E0E0E0'}}>
                        <span className="font-semibold text-sm" style={{color: '#999999'}}>
                          3
                        </span>
                      </div>
                      <span className="font-medium font-sans" style={{color: '#999999'}}>
                        Edit a game with blocks
                      </span>
                    </div>
                    <div className="text-sm" style={{color: '#999999'}}>Coming Soon</div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 p-4 rounded-xl" style={{backgroundColor: '#F5F5F5'}}>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold" style={{color: '#148AFF'}}>
                        5
                      </div>
                      <div className="text-sm" style={{color: '#666666'}}>Games</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{color: '#148AFF'}}>
                        12
                      </div>
                      <div className="text-sm" style={{color: '#666666'}}>Hours</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{color: '#148AFF'}}>
                        3
                      </div>
                      <div className="text-sm" style={{color: '#666666'}}>Skills</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
