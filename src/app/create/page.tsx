"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Sparkles,
  Loader,
  ArrowLeft,
  Play,
  Trophy,
  Heart,
  MessageCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackgroundDecorations from "@/components/ui/BackgroundDecorations";
import type { GameLogic } from "@/types";

const CreateGamePage: React.FC = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedGame] = useState<GameLogic | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [recognition, setRecognition] = useState<any>(null);

  const handleGenerateGame = useCallback(async () => {
    console.log("🎮 CREATE MY GAME CLICKED! Prompt:", prompt.trim());

    if (!prompt.trim()) {
      console.log("❌ No prompt provided");
      setError("Please describe your game idea first!");
      return;
    }

    console.log("✅ Starting game generation...");
    setIsGenerating(true);
    setError(null);

    try {
      // Use the new HTML game generation API
      console.log("🎮 Using HTML game generation!");

      const response = await fetch("/api/generateHTMLGame", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          kidAgeBand: "8-10", // Default age band
          complexity: "simple",
          gameType: "adventure",
        }),
      });

      if (!response.ok) {
        throw new Error(`Game generation API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("📨 API Response:", data);

      if (data.success && data.htmlGame) {
        console.log("✅ HTML Game generated successfully!");
        console.log("🎮 Game title:", data.gameTitle);
        console.log("📏 HTML size:", data.htmlGame.length, "characters");
        // Store the HTML game data
        const gameData = {
          type: "html",
          html: data.htmlGame,
          title: data.gameTitle,
          description: `Generated from: "${prompt.trim()}"`,
          zambooMessage: data.zambooMessage,
        };
        localStorage.setItem("currentGame", JSON.stringify(gameData));
        console.log("🔄 Navigating to game page...");
        router.push("/game");
      } else {
        console.log("❌ Game generation failed:", data.error);
        throw new Error(data.error || "Game generation failed");
      }
    } catch (err) {
      console.error("💥 Game generation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again!"
      );
    } finally {
      console.log("🏁 Setting isGenerating to false");
      setIsGenerating(false);
    }
  }, [prompt, router]);

  const startListening = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError(
        "Voice recognition is not supported in your browser. Please try typing your idea instead!"
      );
      return;
    }

    // @ts-ignore - Web Speech API types
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = "en-US";
    recognitionInstance.maxAlternatives = 1;

    setRecognition(recognitionInstance);
    setIsListening(true);
    setError(null);

    recognitionInstance.onstart = () => {
      console.log("🎤 Voice recognition started");
    };

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 Voice recognition result:", transcript);

      if (transcript.trim()) {
        setPrompt((prev) => {
          const newPrompt = prev ? `${prev} ${transcript}` : transcript;
          return newPrompt;
        });
      }
    };

    recognitionInstance.onerror = (event: any) => {
      console.error("🎤 Voice recognition error:", event.error);
      setIsListening(false);
      setRecognition(null);

      switch (event.error) {
        case "no-speech":
          setError(
            "No speech detected. Please try speaking louder or closer to your microphone."
          );
          break;
        case "network":
          setError(
            "Network error. Please check your internet connection and try again."
          );
          break;
        case "not-allowed":
          setError(
            "Microphone permission denied. Please allow microphone access and try again."
          );
          break;
        case "audio-capture":
          setError(
            "No microphone found. Please check your microphone connection."
          );
          break;
        case "aborted":
          // User intentionally stopped, don't show error
          break;
        default:
          setError(
            "Voice recognition failed. Please try typing your idea instead."
          );
      }
    };

    recognitionInstance.onend = () => {
      console.log("🎤 Voice recognition ended");
      setIsListening(false);
      setRecognition(null);
    };

    try {
      recognitionInstance.start();
    } catch (error) {
      console.error("🎤 Failed to start voice recognition:", error);
      setIsListening(false);
      setRecognition(null);
      setError(
        "Failed to start voice recognition. Please try again or type your idea."
      );
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      setRecognition(null);
    }
  }, [recognition]);

  const helpfulTips = [
    "Don't worry if you're not sure - just describe what sounds fun to you!",
    "You can say 'a panda collecting bamboo' or 'a rocket flying through space'!",
    "Try thinking about your favorite animals, places, or activities!",
    "Want to make a maze? A racing game? A puzzle? I can help with any idea!",
    "Remember: there are no wrong answers - just fun games waiting to be made! 🎮",
  ];

  // Auto-rotate tips every 5 seconds when chat is open
  useEffect(() => {
    if (showChat) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % helpfulTips.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showChat, helpfulTips.length]);

  return (
    <div className="min-h-screen bg-neutral-50 relative flex flex-col">
      {/* Animated Background Decorations */}
      <BackgroundDecorations />

      {/* Navigation Header */}
      <nav className="bg-white shadow-soft border-b border-neutral-200 relative z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors font-medium"
              >
                <ArrowLeft size={20} />
                <span className="text-base hidden sm:inline">Back</span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-3xl sm:text-4xl animate-panda-bounce cursor-pointer">
                  🐼
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-duo-green-500 font-display">
                  zamboo
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1 sm:gap-2 text-duo-blue-600 font-bold">
                <Trophy size={18} className="sm:w-5 sm:h-5" />
                <span className="text-base sm:text-lg">500</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-duo-red-500 font-bold">
                <Heart size={18} className="sm:w-5 sm:h-5" />
                <span className="text-base sm:text-lg">5</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 relative z-10 min-h-0">
        {/* Full Height Sidebar - Duolingo Style */}
        <aside className="hidden lg:flex lg:w-72 bg-white border-r border-neutral-200 flex-col flex-shrink-0">
          <div className="p-4 flex-1">
            <div className="sticky top-6">
              <div className="space-y-2">
                <Link href="/create" className="nav-item active">
                  <div className="nav-icon">🏠</div>
                  <span className="font-bold text-sm tracking-wide">
                    CREATE
                  </span>
                </Link>

                <Link href="/savedgames" className="nav-item">
                  <div className="nav-icon">💾</div>
                  <span className="font-bold text-sm tracking-wide">
                    SAVED GAMES
                  </span>
                </Link>

                <div className="nav-item">
                  <div className="nav-icon">🏆</div>
                  <span className="font-bold text-sm tracking-wide">
                    QUESTS
                  </span>
                </div>

                <div className="nav-item">
                  <div className="nav-icon">📊</div>
                  <span className="font-bold text-sm tracking-wide">
                    LEADERBOARD
                  </span>
                </div>

                <div className="nav-item">
                  <div className="nav-icon">👤</div>
                  <span className="font-bold text-sm tracking-wide">
                    PROFILE
                  </span>
                </div>

                <div className="nav-item">
                  <div className="nav-icon">⋯</div>
                  <span className="font-bold text-sm tracking-wide">MORE</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-y-auto min-w-0">
          <div className="max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-800 mb-2 font-display leading-tight">
                Create Your Game!
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 font-medium px-4">
                Tell me your game idea and I'll bring it to life! 🎮
              </p>
            </div>

            {/* Main Game Idea Section */}
            <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 font-display flex items-center gap-2">
                  <Sparkles
                    className="text-duo-blue-500 flex-shrink-0"
                    size={28}
                  />
                  <span className="leading-tight">What's Your Game Idea?</span>
                </h2>

                <button
                  onClick={handleGenerateGame}
                  disabled={!prompt.trim() || isGenerating}
                  className={`bg-duo-green-500 hover:bg-duo-green-600 active:bg-duo-green-700 text-white font-bold py-3 px-6 rounded-xl text-base shadow-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    isGenerating
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:shadow-strong transform hover:scale-[1.02]"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader
                        className="animate-spin flex-shrink-0"
                        size={18}
                      />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Play className="flex-shrink-0" size={18} />
                      <span>Create Game</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your game idea here... like 'a panda collecting bamboo in a magical forest'!"
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-neutral-200 rounded-2xl focus:border-duo-blue-500 focus:ring-4 focus:ring-duo-blue-100 outline-none transition-all duration-200 text-base min-h-[250px] sm:min-h-[250px] resize-none font-medium"
                    disabled={isGenerating}
                  />

                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isGenerating}
                    className={`absolute bottom-4 right-4 p-4 rounded-2xl shadow-medium transition-all ${
                      isListening
                        ? "bg-duo-red-500 hover:bg-duo-red-600 text-white"
                        : "bg-duo-blue-500 hover:bg-duo-blue-600 text-white"
                    } disabled:opacity-50`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                </div>

                {isListening && (
                  <motion.div
                    className="text-center text-duo-blue-600 font-medium py-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-3 h-3 bg-duo-red-500 rounded-full animate-pulse"></div>
                      <span className="text-base">
                        🎤 Listening... speak your game idea!
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Revolutionary Examples */}
                <div className="bg-neutral-50 rounded-2xl p-3 sm:p-4">
                  <h4 className="text-xl sm:text-xl font-bold text-neutral-800 mb-2 sm:mb-3 font-display">
                    Revolutionary Examples - Try These!
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {[
                      "Happy panda collecting bamboos in the forest",
                      "Little fish swimming and eating bubbles",
                      "Cute bunny jumping over carrots in the garden",
                      "Friendly robot helping kids clean up toys",
                      "Dancing penguin catching falling snowflakes",
                      "Smiling sun helping flowers grow by giving light",
                      "Girl walking through forest collecting berries",
                      "Car racing games with obstacles and gems",
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(example)}
                        className="bg-white hover:bg-duo-blue-50 text-left p-2 sm:p-3 text-base sm:text-base font-medium rounded-xl border border-neutral-200 hover:border-duo-blue-200 hover:text-duo-blue-700 transition-colors disabled:opacity-50 leading-tight"
                        disabled={isGenerating}
                      >
                        <span className="flex items-start gap-2">
                          <span className="flex-shrink-0">💡</span>
                          <span className="min-w-0">{example}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl shadow-soft p-6 border-l-4 border-duo-red-500 mt-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-duo-red-500 text-3xl">⚠️</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-duo-red-800 text-lg mb-2">
                        Oops!
                      </h4>
                      <p className="text-duo-red-600 text-base mb-4 font-medium">
                        {error}
                      </p>
                      <button
                        onClick={() => setError(null)}
                        className="bg-white hover:bg-neutral-50 text-neutral-700 font-bold py-2 px-4 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {generatedGame && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white rounded-2xl shadow-soft p-8 text-center bg-gradient-to-br from-duo-green-50 to-duo-green-100 border-l-4 border-duo-green-500 mt-6"
                >
                  <div className="text-5xl mb-4">🎉</div>
                  <h4 className="font-bold text-duo-green-800 text-2xl mb-3 font-display">
                    Game Created!
                  </h4>
                  <p className="text-duo-green-600 mb-4 text-lg font-medium">
                    Your game "{generatedGame.title}" is ready to play!
                  </p>
                  <div className="flex items-center justify-center gap-3 text-duo-green-700 animate-pulse">
                    <Play size={20} />
                    <span className="text-base font-bold">
                      Starting game...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-14 sm:bottom-16 right-0 w-72 sm:w-80 bg-white rounded-2xl shadow-strong border border-neutral-200 p-4 mb-2 max-w-[calc(100vw-2rem)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-duo-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🐼</span>
                  </div>
                  <span className="font-bold text-neutral-800 text-sm">
                    Zamboo's Tips
                  </span>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <motion.div
                key={currentTipIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-neutral-700 text-sm leading-relaxed"
              >
                {helpfulTips[currentTipIndex]}
              </motion.div>

              <div className="flex justify-center mt-3 gap-1">
                {helpfulTips.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTipIndex
                        ? "bg-duo-green-500"
                        : "bg-neutral-200"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setShowChat(!showChat)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-duo-green-500 hover:bg-duo-green-600 text-white rounded-full shadow-strong flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            showChat
              ? {}
              : {
                  y: [0, -4, 0],
                  rotate: [0, 5, -5, 0],
                }
          }
          transition={
            showChat
              ? {}
              : {
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }
          }
        >
          {showChat ? (
            <X size={20} className="sm:w-6 sm:h-6" />
          ) : (
            <MessageCircle size={20} className="sm:w-6 sm:h-6" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default CreateGamePage;
