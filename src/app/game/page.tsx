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
  Mic,
  MicOff,
  Package,
  Play,
  Square,
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
  const [showEditor, setShowEditor] = useState(true);
  const [zambooState, setZambooState] = useState<ZambooState>({
    mood: "excited",
    animation: "idle",
  });
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    bestScore: 0,
  });
  const [isListening, setIsListening] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [recognitionRef, setRecognitionRef] = useState<any>(null);
  const [codingBlocks, setCodingBlocks] = useState([
    { id: 'player', type: 'object', name: 'Player', color: 'bg-blue-500', x: 50, y: 50 },
    { id: 'collectible', type: 'object', name: 'Collectible', color: 'bg-yellow-500', x: 200, y: 50 },
    { id: 'move-right', type: 'action', name: 'Move Right', color: 'bg-green-500', x: 50, y: 150 },
    { id: 'jump', type: 'action', name: 'Jump', color: 'bg-purple-500', x: 200, y: 150 },
    { id: 'collect', type: 'event', name: 'When Collected', color: 'bg-orange-500', x: 50, y: 250 },
    { id: 'score', type: 'action', name: 'Add Score', color: 'bg-red-500', x: 200, y: 250 }
  ]);

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

  const startVoicePrompt = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setZambooState({ mood: "thinking", animation: "thinking" });
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoicePrompt(transcript);
      setIsListening(false);
      setIsProcessingVoice(true);
      
      try {
        const response = await fetch('/api/modifyGame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameLogic: gameLogic,
            modification: transcript
          })
        });
        
        if (response.ok) {
          const modifiedGame = await response.json();
          setGameLogic(modifiedGame);
          localStorage.setItem('currentGame', JSON.stringify(modifiedGame));
          setZambooState({ mood: "excited", animation: "dance" });
          alert(`Game modified: "${transcript}"`);
        } else {
          alert('Failed to modify game');
        }
      } catch (error) {
        console.error('Error modifying game:', error);
        alert('Error modifying game');
      } finally {
        setIsProcessingVoice(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setIsProcessingVoice(false);
      alert('Voice recognition error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setRecognitionRef(recognition);
    recognition.start();
  };

  const stopVoicePrompt = () => {
    if (recognitionRef) {
      recognitionRef.stop();
    }
    setIsListening(false);
  };

  const handleBlockDrag = (blockId: string, newX: number, newY: number) => {
    setCodingBlocks(blocks => 
      blocks.map(block => 
        block.id === blockId 
          ? { ...block, x: newX, y: newY }
          : block
      )
    );
  };

  const applyBlockChanges = async () => {
    if (!gameLogic) return;
    
    try {
      const response = await fetch('/api/applyBlockChanges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameLogic: gameLogic,
          blocks: codingBlocks
        })
      });
      
      if (response.ok) {
        const modifiedGame = await response.json();
        setGameLogic(modifiedGame);
        localStorage.setItem('currentGame', JSON.stringify(modifiedGame));
        setZambooState({ mood: "celebrating", animation: "dance" });
        alert('Block changes applied to game!');
      } else {
        alert('Failed to apply block changes');
      }
    } catch (error) {
      console.error('Error applying block changes:', error);
      alert('Error applying block changes');
    }
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
    <div className="h-screen bg-neutral-50 relative flex flex-col">
      {/* Animated Background Decorations */}
      <BackgroundDecorations />
      {/* Navigation Header */}
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10 flex-shrink-0">
        <div className="w-full px-4 py-2">
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

      <div className="flex-1 p-3 relative z-10 min-h-0">
        <div className="h-full">
          {/* Game Layout */}
          <div
            className={`grid ${
              showEditor ? "grid-cols-1 xl:grid-cols-4" : "grid-cols-1"
            } gap-3 h-full`}
          >
            {/* Main Game Area */}
            <div className={`${showEditor ? "xl:col-span-3" : "col-span-1"} flex flex-col`}>
              <div className="card p-4 flex-1 flex flex-col">
                {/* Game Control Bar */}
                <div className="flex items-center justify-between mb-3">
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
                          : isHTMLGame(gameLogic)
                          ? "🎮 HTML Game"
                          : `Age: ${gameLogic.ageGroup} • Difficulty: ${gameLogic.difficulty}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={isListening ? stopVoicePrompt : startVoicePrompt}
                      disabled={isProcessingVoice}
                      className={`p-3 rounded-xl transition-all ${
                        isListening 
                          ? "bg-duo-red-500 text-white shadow-medium animate-pulse"
                          : isProcessingVoice
                          ? "bg-duo-blue-500 text-white shadow-medium"
                          : "btn-ghost hover:bg-duo-blue-100"
                      }`}
                      title={isListening ? "Stop voice prompt" : "Voice modify game"}
                    >
                      {isProcessingVoice ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : isListening ? (
                        <MicOff size={18} />
                      ) : (
                        <Mic size={18} />
                      )}
                    </button>

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
                <div className="flex-1 min-h-0">
                  {isHTMLGame(gameLogic) ? (
                    /* HTML Game in iframe */
                    <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 flex-shrink-0">
                        <h4 className="font-bold text-sm">🎮 {gameLogic.title}</h4>
                        <p className="text-xs opacity-90">{gameLogic.description}</p>
                      </div>
                      <iframe
                        srcDoc={gameLogic.html}
                        className="flex-1 border-0"
                        sandbox="allow-scripts allow-same-origin"
                        title={gameLogic.title}
                      />
                      <div className="p-2 bg-gray-50 border-t flex-shrink-0">
                        <p className="text-xs text-gray-600 text-center">
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
                      className="w-full h-full game-canvas"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Code Editor Sidebar */}
            <AnimatePresence>
              {showEditor && (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  className="xl:col-span-1 flex flex-col"
                >
                  <div className="card p-3 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-3">
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
                    <div className="mb-3 p-3 bg-duo-green-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-duo-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🐼</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-800 mb-1">
                            Zamboo says:
                          </p>
                          <p className="text-sm text-neutral-600">
                            "Drag blocks to change your game!"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Voice Prompt Status */}
                    {(isListening || voicePrompt || isProcessingVoice) && (
                      <div className="mb-3 p-3 bg-duo-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Mic className="text-duo-blue-500" size={16} />
                          <span className="text-sm font-medium text-duo-blue-700">
                            {isListening ? "Listening..." : isProcessingVoice ? "Processing..." : "Voice Command"}
                          </span>
                        </div>
                        {voicePrompt && (
                          <p className="text-sm text-duo-blue-600 italic">
                            "{voicePrompt}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Visual Coding Blocks */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                          <Package className="text-duo-purple-500" size={18} />
                          Coding Blocks
                        </h4>
                        <button
                          onClick={applyBlockChanges}
                          className="btn-success text-sm px-3 py-2 flex items-center gap-2"
                        >
                          <Play size={14} />
                          Apply Changes
                        </button>
                      </div>
                      
                      <div className="relative flex-1 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 overflow-hidden">
                        <div className="absolute inset-2">
                          {codingBlocks.map((block) => (
                            <div
                              key={block.id}
                              className={`absolute ${block.color} text-white px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-transform hover:scale-105 select-none cursor-move`}
                              style={{ 
                                left: `${Math.min(Math.max(block.x * 0.7, 0), 180)}px`, 
                                top: `${Math.min(Math.max(block.y * 0.8, 0), 160)}px` 
                              }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', block.id);
                              }}
                              onDragEnd={(e) => {
                                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                                if (rect) {
                                  const newX = Math.min(Math.max((e.clientX - rect.left - 30) / 0.7, 0), 260);
                                  const newY = Math.min(Math.max((e.clientY - rect.top - 15) / 0.8, 0), 200);
                                  handleBlockDrag(block.id, newX, newY);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full opacity-70"></div>
                                <span>{block.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Grid lines for visual guidance */}
                        <div className="absolute inset-0 pointer-events-none opacity-10">
                          <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                            {Array.from({ length: 48 }).map((_, i) => (
                              <div key={i} className="border border-neutral-400"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-neutral-500 text-center">
                        💡 Drag blocks to arrange them, then click "Apply Changes" to update your game!
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="bg-neutral-50 rounded-lg p-3 mt-3">
                      <h5 className="text-base font-semibold text-neutral-800 mb-3">
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
                        ) : isHTMLGame(gameLogic) ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Type:</span>
                              <span className="font-medium text-blue-600">
                                🎮 HTML Game
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Format:</span>
                              <span className="font-medium">Self-contained</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">Engine:</span>
                              <span className="font-medium">Canvas/JavaScript</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-600">
                                Interactive:
                              </span>
                              <span className="font-medium text-green-600">
                                ✓ Touch & Keyboard
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

        </div>
      </div>
    </div>
  );
};

export default GamePage;
