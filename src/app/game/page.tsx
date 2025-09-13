"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
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
  Zap,
  Trash2,
  X,
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
  const [selectedCategory, setSelectedCategory] = useState('events');
  const [workspaceBlocks, setWorkspaceBlocks] = useState([
    { id: 'start-1', type: 'event', category: 'events', name: 'When game starts', shape: 'hat', color: 'bg-amber-500', x: 20, y: 20, connected: false },
    { id: 'move-1', type: 'motion', category: 'motion', name: 'Move player right', shape: 'stack', color: 'bg-blue-500', x: 20, y: 80, connected: true, parent: 'start-1' }
  ]);
  
  const blockCategories = {
    events: {
      name: 'Events',
      color: 'bg-amber-500',
      blocks: [
        { id: 'when-start', name: 'When 🏁 game starts', shape: 'hat' },
        { id: 'when-key', name: 'When ⌨️ [arrow] key pressed', shape: 'hat' },
        { id: 'when-touch', name: 'When touching 🎯 [collectible]', shape: 'hat' },
        { id: 'when-click', name: 'When 🖱️ clicked', shape: 'hat' },
        { id: 'when-enemy-hit', name: 'When hit by 👾 enemy', shape: 'hat' },
        { id: 'when-timer', name: 'When ⏰ timer reaches [10]', shape: 'hat' }
      ]
    },
    motion: {
      name: 'Motion',
      color: 'bg-blue-500',
      blocks: [
        { id: 'move-right', name: 'Move ➡️ [10] steps', shape: 'stack' },
        { id: 'move-left', name: 'Move ⬅️ [10] steps', shape: 'stack' },
        { id: 'move-up', name: 'Move ⬆️ [10] steps', shape: 'stack' },
        { id: 'move-down', name: 'Move ⬇️ [10] steps', shape: 'stack' },
        { id: 'jump', name: 'Jump 🦘 with power [300]', shape: 'stack' },
        { id: 'set-speed', name: 'Set speed 🏃 to [200]', shape: 'stack' },
        { id: 'bounce', name: 'Bounce 🏀 off edges', shape: 'stack' },
        { id: 'rotate', name: 'Rotate 🔄 [15] degrees', shape: 'stack' }
      ]
    },
    control: {
      name: 'Control',
      color: 'bg-emerald-500',
      blocks: [
        { id: 'repeat', name: 'Repeat 🔁 [10] times', shape: 'c-stack' },
        { id: 'if', name: 'If 🤔 [touching collectible]', shape: 'c-stack' },
        { id: 'if-else', name: 'If 🤔 [condition] else', shape: 'c-stack' },
        { id: 'wait', name: 'Wait ⏳ [1] seconds', shape: 'stack' },
        { id: 'forever', name: 'Forever ♾️', shape: 'c-stack' },
        { id: 'stop', name: 'Stop 🛑 all scripts', shape: 'stack' },
        { id: 'while', name: 'While 🔄 [condition]', shape: 'c-stack' }
      ]
    },
    game: {
      name: 'Game',
      color: 'bg-purple-500',
      blocks: [
        { id: 'add-score', name: 'Add 🏆 [10] to score', shape: 'stack' },
        { id: 'subtract-score', name: 'Subtract 📉 [5] from score', shape: 'stack' },
        { id: 'play-sound', name: 'Play 🔊 sound [jump]', shape: 'stack' },
        { id: 'change-bg', name: 'Change 🖼️ background to [space]', shape: 'stack' },
        { id: 'game-over', name: 'Game over 💀', shape: 'stack' },
        { id: 'next-level', name: 'Go to 🚪 next level', shape: 'stack' },
        { id: 'spawn-enemy', name: 'Spawn 👾 enemy at [x,y]', shape: 'stack' },
        { id: 'show-message', name: 'Show 💬 message [Hello!]', shape: 'stack' }
      ]
    },
    sensing: {
      name: 'Sensing',
      color: 'bg-cyan-500',
      blocks: [
        { id: 'get-score', name: '🏆 Score', shape: 'reporter' },
        { id: 'get-x', name: '📍 Player X position', shape: 'reporter' },
        { id: 'get-y', name: '📍 Player Y position', shape: 'reporter' },
        { id: 'touching', name: 'Touching 🎯 [collectible]?', shape: 'boolean' },
        { id: 'key-pressed', name: 'Key ⌨️ [space] pressed?', shape: 'boolean' },
        { id: 'timer', name: '⏰ Timer', shape: 'reporter' },
        { id: 'distance-to', name: '📏 Distance to [enemy]', shape: 'reporter' },
        { id: 'random', name: '🎲 Random [1] to [10]', shape: 'reporter' }
      ]
    }
  };

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
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...gameLogic,
      savedAt: new Date().toISOString(),
      stats: gameStats,
      blockWorkspace: workspaceBlocks,
    };

    savedGames.push(gameToSave);
    localStorage.setItem("savedGames", JSON.stringify(savedGames));

    setZambooState({ mood: "happy", animation: "clap" });
    alert(`Game "${gameLogic.title || 'Untitled Game'}" saved successfully! 🎮✨`);
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
    setWorkspaceBlocks(blocks => 
      blocks.map(block => 
        block.id === blockId 
          ? { ...block, x: newX, y: newY }
          : block
      )
    );
  };
  
  const addBlockToWorkspace = (blockTemplate: any) => {
    const newBlock = {
      id: `${blockTemplate.id}-${Date.now()}`,
      type: selectedCategory,
      category: selectedCategory,
      name: blockTemplate.name,
      shape: blockTemplate.shape,
      color: blockCategories[selectedCategory as keyof typeof blockCategories].color,
      x: Math.random() * 200 + 20,
      y: Math.random() * 150 + 20,
      connected: false
    };
    setWorkspaceBlocks(prev => [...prev, newBlock]);
  };
  
  const deleteBlock = (blockId: string) => {
    setWorkspaceBlocks(prev => prev.filter(block => block.id !== blockId));
    setZambooState({ mood: "happy", animation: "idle" });
  };
  
  const clearAllBlocks = () => {
    if (workspaceBlocks.length > 0) {
      setWorkspaceBlocks([]);
      setZambooState({ mood: "encouraging", animation: "thinking" });
    }
  };
  
  const getBlockShape = (shape: string) => {
    switch (shape) {
      case 'hat':
        return 'rounded-t-2xl rounded-b-lg border-b-4';
      case 'stack':
        return 'rounded-lg border-b-2';
      case 'c-stack':
        return 'rounded-lg border-l-4 border-b-2';
      case 'reporter':
        return 'rounded-full px-4';
      case 'boolean':
        return 'rounded-2xl px-3';
      default:
        return 'rounded-lg';
    }
  };

  const applyBlockChanges = async () => {
    if (!gameLogic) return;
    
    try {
      // Generate code from blocks
      const generatedCode = generateCodeFromBlocks(workspaceBlocks);
      
      const response = await fetch('/api/applyBlockChanges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameLogic: gameLogic,
          blocks: workspaceBlocks,
          generatedCode: generatedCode
        })
      });
      
      if (response.ok) {
        const modifiedGame = await response.json();
        setGameLogic(modifiedGame);
        localStorage.setItem('currentGame', JSON.stringify(modifiedGame));
        setZambooState({ mood: "celebrating", animation: "dance" });
        alert(`🎉 Your blocks have been turned into game code! ${generatedCode.summary}`);
      } else {
        alert('Failed to apply block changes');
      }
    } catch (error) {
      console.error('Error applying block changes:', error);
      alert('Error applying block changes');
    }
  };
  
  const generateCodeFromBlocks = (blocks: any[]) => {
    let code: string[] = [];
    let summary = '';
    
    blocks.forEach(block => {
      switch (block.name.split(' ')[0]) {
        case 'Move':
          code.push('player.move()');
          summary += 'Movement, ';
          break;
        case 'Jump':
          code.push('player.jump()');
          summary += 'Jumping, ';
          break;
        case 'Add':
          code.push('score.add()');
          summary += 'Scoring, ';
          break;
        default:
          code.push(`// ${block.name}`);
      }
    });
    
    return {
      code: code.join('\n'),
      summary: summary.slice(0, -2) || 'Block logic applied'
    };
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
    <div className="min-h-screen bg-neutral-50 relative flex flex-col">
      {/* Animated Background Decorations */}
      <BackgroundDecorations />
      {/* Navigation Header */}
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10 flex-shrink-0">
        <div className="w-full px-2 sm:px-4 py-1 sm:py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-3">
              <Link
                href="/"
                className="flex items-center gap-1 text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline text-sm">Back</span>
              </Link>

              <div className="flex items-center gap-1 sm:gap-3">
                <div className="text-lg sm:text-4xl animate-panda-bounce cursor-pointer">
                  🐼
                </div>
                <h1 className="text-sm sm:text-xl font-bold text-duo-green-500 font-display">zamboo</h1>
              </div>

              <div className="h-4 w-px bg-neutral-300 hidden sm:block"></div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xs sm:text-lg font-bold text-neutral-800 font-display truncate">
                  {gameLogic.title}
                </h2>
                <p className="text-xs text-neutral-600 truncate hidden sm:block">
                  {gameLogic.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
              {/* Game Stats */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-600">
                <div className="flex items-center gap-1">
                  <span className="text-xs">Games:</span>
                  <span className="font-bold text-duo-purple-500 text-xs">
                    {gameStats.gamesPlayed}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs">Best:</span>
                  <span className="font-bold text-duo-green-500 text-xs">
                    {gameStats.bestScore}
                  </span>
                </div>
              </div>

              <div className="h-4 w-px bg-neutral-300 hidden lg:block"></div>

              <div className="flex items-center gap-1 text-duo-blue-600 font-medium">
                <Trophy size={14} className="sm:w-[16px] sm:h-[16px]" />
                <span className="text-xs sm:text-sm">500</span>
              </div>
              <div className="flex items-center gap-1 text-duo-red-500 font-medium">
                <Heart size={14} className="sm:w-[16px] sm:h-[16px]" />
                <span className="text-xs sm:text-sm">5</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-1 sm:p-2 relative z-10 overflow-auto">
        <div className="w-full max-w-none mx-auto">
          {/* Game Layout */}
          <div
            className={`${
              showEditor 
                ? "flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-5 gap-2" 
                : "grid grid-cols-1 gap-2"
            } min-h-[calc(100vh-120px)]`}
          >
            {/* Main Game Area */}
            <div className={`${showEditor ? "order-1 lg:col-span-2 xl:col-span-3" : "col-span-1"} flex flex-col ${
              showEditor ? "h-[50vh] lg:h-auto lg:min-h-full" : "min-h-full"
            }`}>
              <div className="card p-2 sm:p-3 flex-1 flex flex-col overflow-hidden">
                {/* Game Control Bar */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-duo-green-500 rounded-full flex items-center justify-center shadow-medium">
                      <span className="text-base sm:text-xl">🎮</span>
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-xl font-bold text-neutral-800 font-display">
                        Playing Now
                      </h3>
                      <p className="text-xs text-neutral-600 hidden sm:block">
                        {isConceptFirstGame(gameLogic)
                          ? `🚀 Concept-First • Created by: ${gameLogic.createdBy}`
                          : isHTMLGame(gameLogic)
                          ? "🎮 HTML Game"
                          : `Age: ${gameLogic.ageGroup} • Difficulty: ${gameLogic.difficulty}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={isListening ? stopVoicePrompt : startVoicePrompt}
                      disabled={isProcessingVoice}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all ${
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
                      onClick={handleSaveGame}
                      className="w-auto h-10 sm:h-12 px-3 sm:px-4 rounded-xl flex items-center gap-2 text-white bg-duo-green-500 hover:bg-duo-green-600 transition-all"
                      title="Save game"
                    >
                      <Save size={18} />
                      <span className="text-sm font-medium hidden sm:inline">Save</span>
                    </button>

                    <button
                      onClick={() => setShowEditor(!showEditor)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all ${
                        showEditor
                          ? "bg-duo-purple-500 text-white shadow-medium"
                          : "btn-ghost hover:bg-duo-purple-100"
                      }`}
                      title="Edit game code"
                    >
                      <Code size={18} />
                    </button>
                  </div>
                </div>

                {/* Render different game types */}
                <div className="flex-1 min-h-0 h-full">
                  {isHTMLGame(gameLogic) ? (
                    /* HTML Game in iframe */
                    <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 flex-shrink-0">
                        <h4 className="font-bold text-xs sm:text-sm">🎮 {gameLogic.title}</h4>
                        <p className="text-xs opacity-90 hidden sm:block">{gameLogic.description}</p>
                      </div>
                      <div className="flex-1 overflow-hidden" style={{ 
                        minHeight: showEditor ? '300px' : '400px', 
                        height: showEditor ? 'calc(50vh - 100px)' : 'calc(100vh - 150px)' 
                      }}>
                        <iframe
                          srcDoc={gameLogic.html}
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin"
                          title={gameLogic.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            minHeight: showEditor ? '300px' : '400px' 
                          }}
                        />
                      </div>
                      <div className="p-1 sm:p-2 bg-gray-50 border-t flex-shrink-0">
                        <p className="text-xs sm:text-sm text-gray-600 text-center">
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
                  initial={{ opacity: 0, y: 300 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 300 }}
                  transition={{ duration: 0.3 }}
                  className="order-2 xl:col-span-2 flex flex-col h-[50vh] lg:h-auto lg:min-h-full"
                >
                  <div className="card p-2 sm:p-3 flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h3 className="text-sm sm:text-xl font-bold text-neutral-800 flex items-center gap-2 font-display">
                        <Code className="text-duo-purple-500" size={16} />
                        <span className="hidden sm:inline">Game Code</span>
                        <span className="sm:hidden">Code</span>
                      </h3>
                      <button
                        onClick={() => setShowEditor(false)}
                        className="text-neutral-500 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Zamboo Code Tutor */}
                    <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-duo-green-50 rounded-lg">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-duo-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm sm:text-lg">🐼</span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-neutral-800 mb-1">
                            Zamboo says:
                          </p>
                          <p className="text-xs text-neutral-600">
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

                    {/* Scratch-like Visual Coding Blocks */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="text-sm sm:text-base font-semibold text-neutral-800 flex items-center gap-1 sm:gap-2">
                          <Package className="text-duo-purple-500" size={14} />
                          <span className="hidden sm:inline">Code Blocks</span>
                          <span className="sm:hidden">Blocks</span>
                        </h4>
                        <div className="flex items-center gap-2">
                          {workspaceBlocks.length > 0 && (
                            <button
                              onClick={clearAllBlocks}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-all border border-red-200"
                              title="Clear all blocks"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <button
                            onClick={applyBlockChanges}
                            className="h-8 px-3 rounded-lg flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                          >
                            <Play size={14} />
                            <span>Run</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Scratch-style Block Categories */}
                      <div className="mb-2 sm:mb-3">
                        <div className="grid grid-cols-5 gap-1 text-xs">
                          {Object.entries(blockCategories).map(([key, category]) => (
                            <button
                              key={key}
                              onClick={() => setSelectedCategory(key)}
                              className={`h-14 sm:h-16 px-1 py-2 rounded-lg transition-all duration-200 font-bold border relative overflow-hidden group flex flex-col items-center justify-center ${
                                selectedCategory === key 
                                  ? `${category.color} text-white shadow-lg border-white/30 scale-105` 
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-300 hover:scale-105'
                              }`}
                              style={selectedCategory === key ? {
                                background: `linear-gradient(135deg, ${category.color.replace('bg-', '')}-500, ${category.color.replace('bg-', '')}-600)`,
                                boxShadow: '0 6px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                              } : {}}
                            >
                              {/* Scratch-style category highlight */}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              
                              <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-full h-full">
                                {/* Category icons */}
                                {key === 'events' && <span className="text-lg">⚡</span>}
                                {key === 'motion' && <span className="text-lg">🏃</span>}
                                {key === 'control' && <span className="text-lg">🔄</span>}
                                {key === 'game' && <span className="text-lg">🎮</span>}
                                {key === 'sensing' && <span className="text-lg">👁️</span>}
                                
                                <span className="text-xs font-bold leading-tight text-center">
                                  {key === 'events' ? 'Event' : key === 'motion' ? 'Move' : key === 'control' ? 'Loop' : key === 'game' ? 'Game' : 'Sense'}
                                </span>
                              </div>
                              
                              {/* Active indicator */}
                              {selectedCategory === key && (
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-white/50 rounded-t-full"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Scratch-like Block Palette */}
                      <div className="mb-2 sm:mb-3 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg sm:rounded-xl p-2 border border-neutral-200 shadow-inner">
                        <h5 className="text-xs font-bold text-neutral-700 mb-2 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></span>
                          <span className="hidden sm:inline">{blockCategories[selectedCategory as keyof typeof blockCategories]?.name} Blocks</span>
                          <span className="sm:hidden">Blocks</span>
                        </h5>
                        <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                          {blockCategories[selectedCategory as keyof typeof blockCategories]?.blocks.map((block) => (
                            <div
                              key={block.id}
                              onClick={() => addBlockToWorkspace(block)}
                              className={`${
                                blockCategories[selectedCategory as keyof typeof blockCategories].color
                              } text-white px-2 sm:px-3 py-2 sm:py-2 text-xs sm:text-sm rounded-md sm:rounded-lg cursor-pointer hover:opacity-90 transition-all duration-200 ${
                                getBlockShape(block.shape)
                              } shadow-md hover:shadow-lg transform hover:scale-105 hover:-translate-y-1 select-none relative overflow-hidden group w-full flex items-center justify-start`}
                              style={{
                                background: `linear-gradient(135deg, ${blockCategories[selectedCategory as keyof typeof blockCategories].color.replace('bg-', '')}-500, ${blockCategories[selectedCategory as keyof typeof blockCategories].color.replace('bg-', '')}-600)`,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                              }}
                            >
                              {/* Scratch-style highlight */}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              
                              <div className="flex items-center gap-2 relative z-10 w-full">
                                {/* Block type icons with better styling */}
                                {block.shape === 'hat' && <span className="text-yellow-200 text-sm sm:text-base flex-shrink-0">⚡</span>}
                                {block.shape === 'stack' && <span className="text-blue-200 text-sm sm:text-base flex-shrink-0">🔧</span>}
                                {block.shape === 'c-stack' && <span className="text-green-200 text-sm sm:text-base flex-shrink-0">🔄</span>}
                                {block.shape === 'reporter' && <span className="text-purple-200 text-sm sm:text-base flex-shrink-0">📊</span>}
                                {block.shape === 'boolean' && <span className="text-orange-200 text-sm sm:text-base flex-shrink-0">❓</span>}
                                
                                <span className="font-medium leading-tight text-xs sm:text-sm flex-1 text-left">
                                  {block.name.replace(/\[(.*?)\]/g, '($1)')}
                                </span>
                                
                                {/* Add icon */}
                                <span className="text-white/70 text-sm font-bold group-hover:text-white transition-colors flex-shrink-0">+</span>
                              </div>
                              
                              {/* Connection notches like Scratch */}
                              {block.shape === 'stack' && (
                                <>
                                  <div className="absolute -top-1 left-6 w-4 h-2 bg-white/20 rounded-t-lg"></div>
                                  <div className="absolute -bottom-1 left-6 w-4 h-2 bg-black/20 rounded-b-lg"></div>
                                </>
                              )}
                              {block.shape === 'hat' && (
                                <div className="absolute -bottom-1 left-6 w-4 h-2 bg-black/20 rounded-b-lg"></div>
                              )}
                              {block.shape === 'c-stack' && (
                                <>
                                  <div className="absolute -top-1 left-6 w-4 h-2 bg-white/20 rounded-t-lg"></div>
                                  <div className="absolute -bottom-1 left-6 w-4 h-2 bg-black/20 rounded-b-lg"></div>
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-black/10 rounded-r-lg"></div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Scratch-like Workspace */}
                      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-lg sm:rounded-xl border border-blue-200 overflow-hidden relative shadow-inner" style={{ minHeight: '180px', maxHeight: '280px' }}>
                        {/* Background grid pattern like Scratch */}
                        <div className="absolute inset-0 opacity-30" style={{
                          backgroundImage: `
                            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: '20px 20px'
                        }}></div>
                        
                        {/* Drop zones for better UX */}
                        <div className="absolute inset-2 sm:inset-4 overflow-auto" style={{ height: 'calc(100% - 16px)', width: 'calc(100% - 16px)' }}>
                          {workspaceBlocks.map((block) => (
                            <div
                              key={block.id}
                              className={`group absolute ${block.color} text-white font-bold transition-all duration-200 select-none cursor-move shadow-xl hover:shadow-2xl ${
                                getBlockShape(block.shape)
                              } ${block.connected ? 'ring-4 ring-yellow-300 ring-opacity-75' : ''} relative overflow-hidden`}
                              style={{ 
                                left: `${Math.min(Math.max(block.x, 0), 300)}px`, 
                                top: `${Math.min(Math.max(block.y, 0), 200)}px`,
                                minWidth: '120px',
                                fontSize: '11px',
                                padding: block.shape === 'reporter' ? '4px 12px' : '6px 10px',
                                background: `linear-gradient(135deg, ${block.color.replace('bg-', '')}-500, ${block.color.replace('bg-', '')}-600)`,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                              }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', block.id);
                                e.currentTarget.style.transform = 'rotate(3deg) scale(1.05)';
                                e.currentTarget.style.zIndex = '1000';
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                                e.currentTarget.style.zIndex = 'auto';
                                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                                if (rect) {
                                  const newX = Math.min(Math.max(e.clientX - rect.left - 60, 0), 300);
                                  const newY = Math.min(Math.max(e.clientY - rect.top - 15, 0), 200);
                                  handleBlockDrag(block.id, newX, newY);
                                }
                              }}
                              onDoubleClick={() => deleteBlock(block.id)}
                            >
                              {/* Scratch-style gloss effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-lg pointer-events-none"></div>
                              
                              <div className="flex items-center gap-2 relative z-10">
                                {/* Enhanced block type indicators */}
                                {block.shape === 'hat' && (
                                  <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse mr-1"></div>
                                    <span className="text-yellow-200 text-lg">⚡</span>
                                  </div>
                                )}
                                {block.shape === 'stack' && (
                                  <div className="flex items-center">
                                    <div className="w-2 h-5 bg-white/40 rounded mr-1"></div>
                                    <span className="text-blue-200 text-lg">🔧</span>
                                  </div>
                                )}
                                {block.shape === 'c-stack' && (
                                  <div className="flex items-center">
                                    <div className="w-2 h-5 bg-white/40 rounded mr-1"></div>
                                    <span className="text-green-200 text-lg">🔄</span>
                                  </div>
                                )}
                                {block.shape === 'reporter' && (
                                  <span className="text-purple-200 text-lg">📊</span>
                                )}
                                {block.shape === 'boolean' && (
                                  <span className="text-orange-200 text-lg">❓</span>
                                )}
                                
                                <span className="text-sm font-bold leading-tight flex-1">
                                  {block.name.replace(/\[(.*?)\]/g, '($1)')}
                                </span>
                                
                                {/* Enhanced delete button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    deleteBlock(block.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 z-20 shadow-lg ring-2 ring-white"
                                  title="Delete block (or double-click)"
                                >
                                  <X size={12} className="text-white font-bold" />
                                </button>
                                
                                {block.shape === 'c-stack' && (
                                  <div className="ml-2 text-white/80 text-lg">⟐</div>
                                )}
                              </div>
                              
                              {/* Enhanced Scratch-style connection points */}
                              {block.shape !== 'hat' && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-5 h-3 bg-white/30 rounded-t-lg border-2 border-white/50"></div>
                              )}
                              {block.shape !== 'reporter' && block.shape !== 'boolean' && (
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-3 bg-black/30 rounded-b-lg border-2 border-black/50"></div>
                              )}
                              {block.shape === 'c-stack' && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-8 bg-black/20 rounded-r-lg border-2 border-black/30"></div>
                              )}
                              
                              {/* Connection indicator for connected blocks */}
                              {block.connected && (
                                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-yellow-400 rounded-l-full animate-pulse"></div>
                              )}
                            </div>
                          ))}
                          
                          {workspaceBlocks.length === 0 && (
                            <div className="flex items-center justify-center text-neutral-500 h-full w-full">
                              <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-dashed border-blue-300 shadow-md max-w-xs">
                                <div className="text-2xl sm:text-4xl mb-1 sm:mb-2 animate-bounce">🎯</div>
                                <div className="text-xs sm:text-sm font-bold text-blue-600 mb-1">Start Building!</div>
                                <div className="text-xs text-neutral-600 mb-1 sm:mb-2">Click blocks above to add them here</div>
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 text-amber-700 p-1 sm:p-2 rounded-md border border-amber-200 text-xs">
                                  <strong>💡 Tips:</strong><br/>
                                  • Drag blocks to move<br/>
                                  • Double-click to delete<br/>
                                  • Connect blocks together
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Snap zones and visual feedback */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="w-full h-full opacity-10">
                            {/* Scratch-style dot grid */}
                            {Array.from({ length: 20 }).map((_, row) => 
                              Array.from({ length: 25 }).map((_, col) => (
                                <div 
                                  key={`${row}-${col}`}
                                  className="absolute w-1 h-1 bg-blue-400 rounded-full"
                                  style={{
                                    left: `${col * 20 + 10}px`,
                                    top: `${row * 20 + 10}px`
                                  }}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-1 text-xs text-neutral-500 text-center bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded flex-shrink-0">
                        🎮 <strong>How to use:</strong> Click blocks → Drag → Double-click to delete → Click "Run"!
                        {workspaceBlocks.length > 0 && (
                          <div className="mt-0.5 text-xs text-green-700">
                            ✨ {workspaceBlocks.length} block{workspaceBlocks.length !== 1 ? 's' : ''}
                          </div>
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
