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
        { id: 'when-start', name: 'When game starts', shape: 'hat' },
        { id: 'when-key', name: 'When [arrow] key pressed', shape: 'hat' },
        { id: 'when-touch', name: 'When touching [collectible]', shape: 'hat' },
        { id: 'when-click', name: 'When clicked', shape: 'hat' }
      ]
    },
    motion: {
      name: 'Motion',
      color: 'bg-blue-500',
      blocks: [
        { id: 'move-right', name: 'Move right [10] steps', shape: 'stack' },
        { id: 'move-left', name: 'Move left [10] steps', shape: 'stack' },
        { id: 'jump', name: 'Jump with power [300]', shape: 'stack' },
        { id: 'set-speed', name: 'Set speed to [200]', shape: 'stack' }
      ]
    },
    control: {
      name: 'Control',
      color: 'bg-emerald-500',
      blocks: [
        { id: 'repeat', name: 'Repeat [10] times', shape: 'c-stack' },
        { id: 'if', name: 'If [touching collectible]', shape: 'c-stack' },
        { id: 'wait', name: 'Wait [1] seconds', shape: 'stack' },
        { id: 'forever', name: 'Forever', shape: 'c-stack' }
      ]
    },
    game: {
      name: 'Game',
      color: 'bg-purple-500',
      blocks: [
        { id: 'add-score', name: 'Add [10] to score', shape: 'stack' },
        { id: 'play-sound', name: 'Play sound [jump]', shape: 'stack' },
        { id: 'change-bg', name: 'Change background to [space]', shape: 'stack' },
        { id: 'game-over', name: 'Game over', shape: 'stack' }
      ]
    },
    sensing: {
      name: 'Sensing',
      color: 'bg-cyan-500',
      blocks: [
        { id: 'get-score', name: 'Score', shape: 'reporter' },
        { id: 'get-x', name: 'Player X position', shape: 'reporter' },
        { id: 'touching', name: 'Touching [collectible]?', shape: 'boolean' },
        { id: 'key-pressed', name: 'Key [space] pressed?', shape: 'boolean' }
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
                      className="btn-primary p-3 rounded-xl flex items-center gap-2 text-white bg-duo-green-500 hover:bg-duo-green-600"
                      title="Save game"
                    >
                      <Save size={18} />
                      <span className="text-sm font-medium">Save</span>
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

                    {/* Scratch-like Visual Coding Blocks */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                          <Package className="text-duo-purple-500" size={18} />
                          Code Blocks
                        </h4>
                        <div className="flex items-center gap-2">
                          {workspaceBlocks.length > 0 && (
                            <button
                              onClick={clearAllBlocks}
                              className="btn-ghost text-xs px-1 py-0.5 flex items-center gap-1 text-red-600 hover:bg-red-50 transition-all"
                              title="Clear all blocks"
                            >
                              <Trash2 size={12} />
                              Clear
                            </button>
                          )}
                          <button
                            onClick={applyBlockChanges}
                            className="btn-success text-xs px-2 py-1 flex items-center gap-1 shadow-lg hover:shadow-xl transition-all"
                          >
                            <Play size={12} />
                            🚀 Run Code
                          </button>
                        </div>
                      </div>
                      
                      {/* Block Categories */}
                      <div className="mb-3">
                        <div className="flex gap-2 text-sm">
                          {Object.entries(blockCategories).map(([key, category]) => (
                            <button
                              key={key}
                              onClick={() => setSelectedCategory(key)}
                              className={`px-2 py-1 rounded-lg transition-all font-semibold ${
                                selectedCategory === key 
                                  ? `${category.color} text-white shadow-lg` 
                                  : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                              }`}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Block Palette */}
                      <div className="mb-4 bg-neutral-100 rounded-lg p-3 max-h-36 overflow-y-auto">
                        <div className="space-y-2">
                          {blockCategories[selectedCategory as keyof typeof blockCategories]?.blocks.map((block) => (
                            <div
                              key={block.id}
                              onClick={() => addBlockToWorkspace(block)}
                              className={`${
                                blockCategories[selectedCategory as keyof typeof blockCategories].color
                              } text-white px-3 py-2 text-sm rounded-lg cursor-pointer hover:opacity-80 transition-all ${
                                getBlockShape(block.shape)
                              } shadow-md hover:shadow-lg transform hover:scale-105`}
                            >
                              <div className="flex items-center gap-1">
                                {block.shape === 'hat' && <span>🎯</span>}
                                {block.shape === 'stack' && <span>📦</span>}
                                {block.shape === 'c-stack' && <span>🔄</span>}
                                {block.shape === 'reporter' && <span>📊</span>}
                                {block.shape === 'boolean' && <span>❓</span>}
                                <span>{block.name.replace(/\[(.*?)\]/g, '($1)')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Workspace */}
                      <div className="flex-1 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 overflow-hidden relative">
                        <div className="absolute inset-2">
                          {workspaceBlocks.map((block) => (
                            <div
                              key={block.id}
                              className={`group absolute ${block.color} text-white text-base font-semibold transition-all hover:scale-105 select-none cursor-move shadow-lg hover:shadow-xl ${
                                getBlockShape(block.shape)
                              } ${block.connected ? 'border-l-4 border-yellow-400' : ''}`}
                              style={{ 
                                left: `${Math.min(Math.max(block.x, 0), 220)}px`, 
                                top: `${Math.min(Math.max(block.y, 0), 180)}px`,
                                minWidth: '140px',
                                padding: block.shape === 'reporter' ? '6px 16px' : '8px 12px'
                              }}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', block.id);
                                e.currentTarget.style.transform = 'rotate(5deg)';
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.style.transform = 'rotate(0deg)';
                                const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                                if (rect) {
                                  const newX = Math.min(Math.max(e.clientX - rect.left - 60, 0), 220);
                                  const newY = Math.min(Math.max(e.clientY - rect.top - 15, 0), 180);
                                  handleBlockDrag(block.id, newX, newY);
                                }
                              }}
                              onDoubleClick={() => deleteBlock(block.id)}
                            >
                              <div className="flex items-center gap-1 relative">
                                {/* Block type indicators */}
                                {block.shape === 'hat' && (
                                  <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                                )}
                                {block.shape === 'stack' && (
                                  <div className="w-1 h-4 bg-white/30 rounded"></div>
                                )}
                                
                                <span className="text-xs leading-tight flex-1">
                                  {block.name.replace(/\[(.*?)\]/g, '($1)')}
                                </span>
                                
                                {/* Delete button (appears on hover) */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    deleteBlock(block.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 z-10"
                                  title="Delete block (or double-click)"
                                >
                                  <X size={10} className="text-white" />
                                </button>
                                
                                {block.shape === 'c-stack' && (
                                  <div className="ml-auto text-white/70">⟐</div>
                                )}
                              </div>
                              
                              {/* Connection points */}
                              {block.shape !== 'hat' && (
                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-white/20 rounded-t-full"></div>
                              )}
                              {block.shape !== 'reporter' && block.shape !== 'boolean' && (
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-white/40 rounded-b-full"></div>
                              )}
                            </div>
                          ))}
                          
                          {workspaceBlocks.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-center">
                              <div>
                                <div className="text-4xl mb-2">🧩</div>
                                <div className="text-sm">Click blocks above to add them here!</div>
                                <div className="text-xs mt-1">Then drag them around to build your game logic</div>
                                <div className="text-xs mt-2 bg-yellow-50 text-yellow-700 p-1 rounded border">
                                  💡 <strong>Tips:</strong> Double-click or use X button to delete blocks
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Snap guidelines */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="grid grid-cols-6 grid-rows-5 h-full w-full opacity-5">
                            {Array.from({ length: 30 }).map((_, i) => (
                              <div key={i} className="border border-blue-300"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-neutral-500 text-center bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded">
                        🎮 <strong>How to use:</strong> Click blocks above → Drag them around → Double-click or use ❌ to delete → Click "Run Code"!
                        {workspaceBlocks.length > 0 && (
                          <div className="mt-1 text-xs text-green-700">
                            ✨ You have {workspaceBlocks.length} block{workspaceBlocks.length !== 1 ? 's' : ''} in your workspace
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
