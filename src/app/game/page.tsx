"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  Code,
  RotateCcw,
  Home,
  Share,
  Sparkles,
  Gamepad2,
  BookOpen,
  Users,
  Trophy,
  Heart,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ZambooMascot from "@/components/zamboo/ZambooMascot";
import BackgroundDecorations from "@/components/ui/BackgroundDecorations";
import type { GameLogic, ZambooState } from "@/types";

interface ConceptFirstGame {
  conceptFirst: true;
  experienceAnalysis: string;
  gameImplementation: string;
  userVision: string;
  title: string;
  description: string;
  id: string;
  createdBy: string;
}

interface HTMLGame {
  type: 'html';
  html: string;
  title: string;
  description: string;
  zambooMessage?: string;
}

// Type guard to check if game is concept-first
const isConceptFirstGame = (
  game: GameLogic | ConceptFirstGame | HTMLGame
): game is ConceptFirstGame => {
  return "conceptFirst" in game && game.conceptFirst === true;
};

// Type guard to check if game is HTML
const isHTMLGame = (
  game: GameLogic | ConceptFirstGame | HTMLGame
): game is HTMLGame => {
  return "type" in game && game.type === 'html';
};

// Dynamically import GameContainer to avoid SSR issues
const GameContainer = dynamic(() => import("@/components/game/GameContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-neutral-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-duo-purple-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-neutral-600 font-medium">Loading game engine...</p>
      </div>
    </div>
  ),
});

const GamePage: React.FC = () => {
  const router = useRouter();
  const [gameLogic, setGameLogic] = useState<
    GameLogic | ConceptFirstGame | HTMLGame | null
  >(null);
  const [showEditor, setShowEditor] = useState(false);
  const [zambooState, setZambooState] = useState<ZambooState>({
    mood: "excited",
    animation: "idle",
  });
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,
  });

  useEffect(() => {
    // Load game from localStorage (from create page or template)
    const savedGame = localStorage.getItem("currentGame");
    if (savedGame) {
      try {
        const game = JSON.parse(savedGame) as GameLogic | ConceptFirstGame | HTMLGame;
        setGameLogic(game);
        setZambooState({ mood: "excited", animation: "dance" });

        // Load game stats
        const stats = localStorage.getItem("gameStats");
        if (stats) {
          setGameStats(JSON.parse(stats));
        }
      } catch (error) {
        console.error("Error loading game:", error);
        router.push("/");
      }
    } else {
      // No game found, redirect to home
      router.push("/");
    }
  }, [router]);

  const handleGameComplete = (won: boolean, score: number) => {
    const newStats = {
      gamesPlayed: gameStats.gamesPlayed + 1,
      totalScore: gameStats.totalScore + score,
      bestScore: Math.max(gameStats.bestScore, score),
    };

    setGameStats(newStats);
    localStorage.setItem("gameStats", JSON.stringify(newStats));

    if (won) {
      setZambooState({ mood: "celebrating", animation: "dance" });
    } else {
      setZambooState({ mood: "encouraging", animation: "thinking" });
    }
  };

  const handleExit = () => {
    router.push("/");
  };

  const handleShare = async () => {
    if (!gameLogic) return;

    try {
      const shareData = {
        title: `Check out my ${gameLogic.title} game!`,
        text: `I created an awesome game called "${gameLogic.title}" using Zamboo! ${gameLogic.description}`,
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Check out my ${gameLogic.title} game! I made it with Zamboo! 🐼🎮`
        );
        alert("Game link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleSaveGame = () => {
    if (!gameLogic) return;

    const savedGames = JSON.parse(localStorage.getItem("savedGames") || "[]");
    const gameToSave = {
      ...gameLogic,
      savedAt: new Date().toISOString(),
      stats: gameStats,
    };

    savedGames.push(gameToSave);
    localStorage.setItem("savedGames", JSON.stringify(savedGames));

    setZambooState({ mood: "happy", animation: "clap" });
    alert("Game saved successfully!");
  };

  if (!gameLogic) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-duo-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">
            Loading your awesome game...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative">
      {/* Animated Background Decorations */}
      <BackgroundDecorations />
      {/* Navigation Header */}
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </Link>

              <div className="flex items-center gap-3">
                <div className="text-4xl animate-panda-bounce cursor-pointer">
                  🐼
                </div>
                <h1 className="logo-text-small">zamboo</h1>
              </div>

              <div className="h-6 w-px bg-neutral-300"></div>

              <div>
                <h2 className="text-lg font-bold text-neutral-800 font-display">
                  {gameLogic.title}
                </h2>
                <p className="text-sm text-neutral-600">
                  {gameLogic.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Game Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm text-neutral-600">
                <div className="flex items-center gap-1">
                  <span>Games:</span>
                  <span className="font-bold text-duo-purple-500">
                    {gameStats.gamesPlayed}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Best:</span>
                  <span className="font-bold text-duo-green-500">
                    {gameStats.bestScore}
                  </span>
                </div>
              </div>

              <div className="h-6 w-px bg-neutral-300 hidden md:block"></div>

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

      <div className="p-6 relative z-10">
        <div className="w-full">
          {/* Game Layout */}
          <div
            className={`grid ${
              showEditor ? "grid-cols-1 xl:grid-cols-3" : "grid-cols-1"
            } gap-8`}
          >
            {/* Main Game Area */}
            <div className={showEditor ? "xl:col-span-2" : "col-span-1"}>
              <div className="card p-6">
                {/* Game Control Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-duo-green-500 rounded-full flex items-center justify-center shadow-medium">
                      <span className="text-xl">🎮</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-800 font-display">
                        Playing Now
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {isConceptFirstGame(gameLogic)
                          ? `🚀 Concept-First • Created by: ${gameLogic.createdBy}`
                          : `Age: ${gameLogic.ageGroup} • Difficulty: ${gameLogic.difficulty}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="btn-ghost p-3 rounded-xl"
                      title="Share game"
                    >
                      <Share size={18} />
                    </button>

                    <button
                      onClick={handleSaveGame}
                      className="btn-ghost p-3 rounded-xl"
                      title="Save game"
                    >
                      <Settings size={18} />
                    </button>

                    <button
                      onClick={() => setShowEditor(!showEditor)}
                      className={`p-3 rounded-xl transition-all ${
                        showEditor
                          ? "bg-duo-purple-500 text-white shadow-medium"
                          : "btn-ghost"
                      }`}
                      title="Edit game code"
                    >
                      <Code size={18} />
                    </button>
                  </div>
                </div>

                {/* Render different game types */}
                {isHTMLGame(gameLogic) ? (
                  /* HTML Game in iframe */
                  <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
                      <h4 className="font-bold">🎮 {gameLogic.title}</h4>
                      <p className="text-sm opacity-90">{gameLogic.description}</p>
                    </div>
                    <iframe
                      srcDoc={gameLogic.html}
                      className="w-full h-[600px] border-0"
                      sandbox="allow-scripts allow-same-origin"
                      title={gameLogic.title}
                    />
                    <div className="p-4 bg-gray-50 border-t">
                      <p className="text-sm text-gray-600 text-center">
                        🎯 Use arrow keys or touch controls to play!
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Traditional GameLogic games */
                  <GameContainer
                    gameLogic={gameLogic}
                    onGameComplete={handleGameComplete}
                    onExit={handleExit}
                    showTutorial={true}
                    className="w-full game-canvas"
                  />
                )}
              </div>
            </div>

            {/* Code Editor Sidebar */}
            <AnimatePresence>
              {showEditor && (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  className="xl:col-span-1"
                >
                  <div className="card p-6 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2 font-display">
                        <Code className="text-duo-purple-500" />
                        Game Code
                      </h3>
                      <button
                        onClick={() => setShowEditor(false)}
                        className="text-neutral-500 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Zamboo Code Tutor */}
                    <div className="mb-6 p-4 bg-duo-green-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-duo-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">🐼</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-800 mb-1">
                            Zamboo says:
                          </p>
                          <p className="text-sm text-neutral-600">
                            "Want to change how your game works? You can edit
                            the blocks here soon!"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Placeholder for future Blockly integration */}
                    <div className="mb-6 p-6 border-2 border-dashed border-neutral-300 rounded-xl text-center">
                      <div className="text-4xl mb-2">🧩</div>
                      <p className="text-neutral-600 text-sm">
                        Visual code editor coming soon! You'll be able to drag
                        and drop blocks to change your game.
                      </p>
                    </div>

                    {/* Game Info */}
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <h5 className="font-semibold text-neutral-800 mb-3 font-display">
                        Game Details
                      </h5>
                      <div className="space-y-2 text-sm">
                        {isConceptFirstGame(gameLogic) ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Generation:
                              </span>
                              <span className="font-medium text-purple-600">
                                🚀 Concept-First
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Approach:
                              </span>
                              <span className="font-medium">
                                Experience-Driven
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Created By:
                              </span>
                              <span className="font-medium capitalize">
                                {gameLogic.createdBy}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Architecture:
                              </span>
                              <span className="font-medium text-purple-600">
                                Revolutionary AI
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Difficulty:
                              </span>
                              <span className="font-medium capitalize">
                                {gameLogic.difficulty}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Age Group:
                              </span>
                              <span className="font-medium">
                                {gameLogic.ageGroup}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Objects:</span>
                              <span className="font-medium">
                                {gameLogic.objects.length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Events:</span>
                              <span className="font-medium">
                                {gameLogic.events.length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Created By:
                              </span>
                              <span className="font-medium capitalize">
                                {gameLogic.createdBy}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8">
            <div className="card p-6 text-center">
              <h3 className="text-xl font-bold text-neutral-800 mb-4 font-display">
                What's Next?
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => router.push("/create")}
                  className="btn-success flex items-center gap-2 px-6 py-3"
                >
                  <Sparkles size={20} />
                  Create Another Game
                </button>

                <button
                  onClick={() => router.push("/templates")}
                  className="btn-secondary flex items-center gap-2 px-6 py-3"
                >
                  <RotateCcw size={20} />
                  Try Templates
                </button>

                <button
                  onClick={handleExit}
                  className="btn-ghost flex items-center gap-2 px-6 py-3"
                >
                  <Home size={20} />
                  Back Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
