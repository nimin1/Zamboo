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
    <div className="h-screen bg-neutral-50 relative flex flex-col">
      {/* Animated Background Decorations */}
      <BackgroundDecorations />
      {/* Navigation Header */}
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10 flex-shrink-0">
        <div className="w-full px-6 py-3">
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
              <h1 className="logo-text-small">zamboo</h1>
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
        {/* Expandable Sidebar */}
        <Sidebar 
          navItems={[
            { href: "/create", icon: "🏠", label: "CREATE", isActive: true },
            { href: "/savedgames", icon: "💾", label: "SAVED GAMES" },
            { href: "/quests", icon: "🏆", label: "QUESTS" },
            { href: "/leaderboard", icon: "📊", label: "LEADERBOARD" },
            { href: "/profile", icon: "👤", label: "PROFILE" },
            { href: "/more", icon: "⋯", label: "MORE" }
          ]}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-2 overflow-hidden">
          <div className="max-w-5xl mx-auto h-full flex flex-col justify-between">
            {/* Hero Section */}
            <div className="card p-4 text-center mb-3">
              <div className="flex items-center justify-center mb-3">
                <ZambooMascot
                  size="medium"
                  state={{ mood: "happy", animation: "idle" }}
                  interactive={true}
                  showSpeechBubble={true}
                  message="Hi there! Ready for a coding adventure? 🚀"
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-3 font-display leading-tight">
                Learn to Code with Games!
              </h1>

              <p className="text-base text-neutral-600 mb-4 max-w-2xl mx-auto">
                I'm Zamboo, your coding companion! Let's create amazing games
                together.
              </p>

              <div className="flex justify-center">
                <Link
                  href="/create"
                  className="btn-success inline-flex items-center gap-2 justify-center text-base py-3 px-6"
                >
                  <Play size={18} />
                  Start Creating Games
                </Link>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
              {/* Feature Cards - Single Row */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="card-interactive p-4 text-center">
                  <div className="w-14 h-14 bg-duo-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Gamepad2 className="text-duo-green-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-2 font-display">
                    Play & Create
                  </h3>
                  <p className="text-base text-neutral-600 leading-relaxed">
                    Speak or type your game ideas and watch them come to life!
                  </p>
                </div>

                <div className="card-interactive p-4 text-center">
                  <div className="w-14 h-14 bg-duo-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Code className="text-duo-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-2 font-display">
                    Learn Coding
                  </h3>
                  <p className="text-base text-neutral-600 leading-relaxed">
                    Discover loops, events, and conditions through gameplay!
                  </p>
                </div>

                <div className="card-interactive p-4 text-center">
                  <div className="w-14 h-14 bg-duo-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="text-duo-purple-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-2 font-display">
                    Edit & Experiment
                  </h3>
                  <p className="text-base text-neutral-600 leading-relaxed">
                    Use visual blocks to modify games in real-time!
                  </p>
                </div>
              </div>

              {/* Progress Section */}
              <div className="card p-3 overflow-hidden flex-1">
                <h2 className="text-lg font-bold text-neutral-800 mb-3 font-display">
                  Your Coding Journey
                </h2>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-duo-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">1</span>
                      </div>
                      <span className="font-medium text-neutral-700 text-sm">
                        Create your first game
                      </span>
                    </div>
                    <div className="text-duo-green-600 font-bold text-sm">
                      ✓
                    </div>
                  </div>

                  <div className="flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center">
                        <span className="text-neutral-500 font-bold text-xs">
                          2
                        </span>
                      </div>
                      <span className="font-medium text-neutral-500 text-sm">
                        Edit a game with prompts
                      </span>
                    </div>
                    <div className="text-neutral-400 text-sm">0 / 4</div>
                  </div>

                  <div className="flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center">
                        <span className="text-neutral-500 font-bold text-xs">
                          3
                        </span>
                      </div>
                      <span className="font-medium text-neutral-500 text-sm">
                        Edit a game with blocks
                      </span>
                    </div>
                    <div className="text-neutral-400 text-sm">Coming Soon</div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-auto p-2 bg-neutral-50 rounded-xl">
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <div className="text-sm font-bold text-duo-blue-600">
                        5
                      </div>
                      <div className="text-xs text-neutral-600">Games</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-duo-green-600">
                        12
                      </div>
                      <div className="text-xs text-neutral-600">Hours</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-duo-purple-600">
                        3
                      </div>
                      <div className="text-xs text-neutral-600">Skills</div>
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
