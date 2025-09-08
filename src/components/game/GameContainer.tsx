'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Home, Settings, Trophy, Heart, Star } from 'lucide-react'
import BeautifulGameEngine from './BeautifulGameEngine'
import EmergentGameEngine from './EmergentGameEngine'
import ZambooGuide from '../zamboo/ZambooGuide'
import type { GameLogic, GameEngineRef, ZambooState } from '@/types'

interface ConceptFirstGame {
  conceptFirst: true
  experienceAnalysis: string
  gameImplementation: string
  userVision: string
  title: string
  description: string
  id: string
  createdBy: string
}

interface GameContainerProps {
  gameLogic: GameLogic | ConceptFirstGame
  onGameComplete?: (won: boolean, score: number) => void
  onExit?: () => void
  showTutorial?: boolean
  className?: string
}

interface GameState {
  isPlaying: boolean
  isPaused: boolean
  isComplete: boolean
  score: number
  hasWon: boolean
  showPauseMenu: boolean
  lives: number
  startTime: Date
}

// Type guard to check if game is concept-first
const isConceptFirstGame = (game: GameLogic | ConceptFirstGame): game is ConceptFirstGame => {
  return 'conceptFirst' in game && game.conceptFirst === true
}

const GameContainer: React.FC<GameContainerProps> = ({
  gameLogic,
  onGameComplete,
  onExit,
  showTutorial: initialShowTutorial = true,
  className = ''
}) => {
  const gameEngineRef = useRef<GameEngineRef>(null)
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    score: 0,
    hasWon: false,
    showPauseMenu: false,
    lives: isConceptFirstGame(gameLogic) ? 3 : (gameLogic.rules?.lives || 3),
    startTime: new Date()
  })
  const [zambooState, setZambooState] = useState<ZambooState>({
    mood: 'happy',
    animation: 'idle'
  })
  const [showTutorial, setShowTutorial] = useState(initialShowTutorial)

  // Game control handlers
  const handleStart = useCallback(() => {
    gameEngineRef.current?.start()
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      startTime: new Date()
    }))
    setZambooState({ mood: 'excited', animation: 'jump' })
  }, [])

  const handlePause = useCallback(() => {
    gameEngineRef.current?.pause()
    setGameState(prev => ({
      ...prev,
      isPaused: true,
      showPauseMenu: true
    }))
    setZambooState({ mood: 'thinking', animation: 'thinking' })
  }, [])

  const handleResume = useCallback(() => {
    gameEngineRef.current?.resume()
    setGameState(prev => ({
      ...prev,
      isPaused: false,
      showPauseMenu: false
    }))
    setZambooState({ mood: 'happy', animation: 'idle' })
  }, [])

  const handleRestart = useCallback(() => {
    gameEngineRef.current?.restart()
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isComplete: false,
      score: 0,
      hasWon: false,
      showPauseMenu: false,
      lives: isConceptFirstGame(gameLogic) ? 3 : (gameLogic.rules?.lives || 3),
      startTime: new Date()
    }))
    setZambooState({ mood: 'excited', animation: 'dance' })
  }, [gameLogic])

  const handleScoreChange = useCallback((newScore: number) => {
    setGameState(prev => {
      const newState = { ...prev, score: newScore }
      
      if (newScore > prev.score) {
        setZambooState({ mood: 'celebrating', animation: 'clap' })
        setTimeout(() => {
          setZambooState({ mood: 'happy', animation: 'idle' })
        }, 2000)
      }
      
      return newState
    })
  }, [])

  const handleGameComplete = useCallback((won: boolean, finalScore: number) => {
    const endTime = new Date()
    const timeSpent = Math.floor((endTime.getTime() - gameState.startTime.getTime()) / 1000)
    
    setGameState(prev => ({
      ...prev,
      isComplete: true,
      hasWon: won,
      score: finalScore,
      isPlaying: false
    }))

    if (won) {
      setZambooState({ mood: 'celebrating', animation: 'dance' })
    } else {
      setZambooState({ mood: 'encouraging', animation: 'thinking' })
    }

    onGameComplete?.(won, finalScore)
  }, [gameState.startTime, onGameComplete])

  const getTutorialMessages = (): string[] => {
    if (isConceptFirstGame(gameLogic)) {
      return [
        `🚀 Welcome to your revolutionary concept-first game!`,
        `This game was created using pure conceptual reasoning - no templates or constraints!`,
        `Experience: ${gameLogic.userVision}`,
        `Get ready for unlimited creativity! Click play when you're ready to explore!`
      ]
    }
    
    const messages = [gameLogic.zambooDialogue.welcome]
    
    if (gameLogic.zambooDialogue.instructions) {
      messages.push(gameLogic.zambooDialogue.instructions)
    }

    if (gameLogic.concepts.length > 0) {
      const concept = gameLogic.concepts[0]
      messages.push(`Today we're learning about ${concept.name}! ${concept.description}`)
    }

    messages.push("Ready to play? Click the play button when you're set!")
    
    return messages
  }

  const getCompletionMessage = (): string => {
    if (isConceptFirstGame(gameLogic)) {
      if (gameState.hasWon) {
        return "🎉 Amazing! You've mastered this revolutionary concept-first experience! The AI's creative vision came to life through your gameplay!"
      } else {
        return "💪 Great exploration! In concept-first games, every attempt teaches us something new. The AI created something unique - let's try again!"
      }
    }
    
    if (gameState.hasWon) {
      return gameLogic.zambooDialogue.victory
    } else {
      return gameLogic.zambooDialogue.defeat
    }
  }

  return (
    <div className={`relative bg-gradient-to-br from-zamboo-50 to-panda-50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full ${className}`}>
      {/* Game Header */}
      <div className="bg-white/90 backdrop-blur-sm px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">{gameLogic.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Trophy size={16} />
              <span>{gameState.score}</span>
              {!isConceptFirstGame(gameLogic) && gameLogic.rules?.lives && (
                <>
                  <Heart size={16} className="ml-4" />
                  <span>{gameState.lives}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!gameState.isPlaying && !gameState.isComplete && (
              <button
                onClick={handleStart}
                className="fun-button flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Play size={16} />
                Start Game
              </button>
            )}
            
            {gameState.isPlaying && !gameState.isPaused && (
              <button
                onClick={handlePause}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm transition-colors"
              >
                <Pause size={16} />
                Pause
              </button>
            )}
            
            {gameState.isPaused && (
              <button
                onClick={handleResume}
                className="fun-button flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Play size={16} />
                Resume
              </button>
            )}
            
            <button
              onClick={handleRestart}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm transition-colors"
            >
              <RotateCcw size={16} />
              Restart
            </button>
            
            {onExit && (
              <button
                onClick={onExit}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm transition-colors"
              >
                <Home size={16} />
                Exit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Game Canvas */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="relative flex-1 min-h-0">
            <div className="w-full h-full">
              {isConceptFirstGame(gameLogic) ? (
                <EmergentGameEngine
                  conceptAnalysis={gameLogic.experienceAnalysis}
                  gameImplementation={gameLogic.gameImplementation}
                  userVision={gameLogic.userVision}
                  className="w-full h-full"
                />
              ) : (
                <BeautifulGameEngine
                  gameLogic={gameLogic}
                  onScoreChange={handleScoreChange}
                  onGameComplete={handleGameComplete}
                  className="w-full h-full"
                />
              )}
            </div>
            
            {/* Game Overlays */}
            <AnimatePresence>
              {showTutorial && !gameState.isPlaying && !gameState.isComplete && (
                <motion.div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-white rounded-2xl p-8 max-w-lg mx-4">
                    <ZambooGuide
                      messages={getTutorialMessages()}
                      initialMood="excited"
                      onComplete={() => setShowTutorial(false)}
                      size="medium"
                      position="center"
                    />
                  </div>
                </motion.div>
              )}
              
              {gameState.showPauseMenu && (
                <motion.div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-white rounded-2xl p-8">
                    <div className="text-center space-y-6">
                      <h3 className="text-2xl font-bold text-gray-800">Game Paused</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={handleResume}
                          className="fun-button flex items-center gap-2 px-6 py-3"
                        >
                          <Play size={20} />
                          Continue
                        </button>
                        <button
                          onClick={handleRestart}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-colors"
                        >
                          <RotateCcw size={20} />
                          Restart
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {gameState.isComplete && (
                <motion.div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="bg-white rounded-2xl p-8 max-w-lg mx-4">
                    <div className="text-center space-y-6">
                      <div className="text-6xl">
                        {gameState.hasWon ? '🏆' : '💪'}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {gameState.hasWon ? 'Congratulations!' : 'Good Try!'}
                      </h3>
                      <div className="flex items-center justify-center space-x-4 text-lg">
                        <div className="flex items-center gap-2">
                          <Trophy className="text-yellow-500" />
                          <span>{gameState.score} points</span>
                        </div>
                        {gameState.hasWon && (
                          <div className="flex items-center gap-2">
                            <Star className="text-yellow-500" />
                            <span>Victory!</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600">{getCompletionMessage()}</p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={handleRestart}
                          className="fun-button flex items-center gap-2 px-6 py-3"
                        >
                          <RotateCcw size={20} />
                          Play Again
                        </button>
                        {onExit && (
                          <button
                            onClick={onExit}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-colors"
                          >
                            <Home size={20} />
                            Back to Menu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Zamboo Sidebar */}
        <div className="w-full lg:w-80 bg-white/50 backdrop-blur-sm p-6 border-l border-gray-200 flex-shrink-0">
          <div className="space-y-6 h-full overflow-y-auto">
            {/* Zamboo Guide */}
            <div className="text-center">
              <ZambooGuide
                messages={
                  gameState.isComplete 
                    ? [getCompletionMessage()] 
                    : gameState.isPaused
                      ? ["Take your time! I'll wait here while you think."]
                      : gameState.isPlaying
                        ? (isConceptFirstGame(gameLogic) ? ["Amazing! You're experiencing revolutionary AI creativity!"] : gameLogic.zambooDialogue.encouragement)
                        : ["Ready for an awesome coding adventure?"]
                }
                initialMood={zambooState.mood}
                autoAdvance={false}
                showControls={false}
                size="medium"
                position="center"
              />
            </div>

            {/* Concept Cards / Experience Analysis */}
            <div className="space-y-4">
              {isConceptFirstGame(gameLogic) ? (
                <>
                  <h4 className="font-bold text-lg text-gray-800">🚀 Revolutionary Experience</h4>
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 shadow-sm border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        ✨
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-purple-800">Concept-First Design</h5>
                        <p className="text-sm text-purple-600 mt-1">This game was generated using pure conceptual reasoning - no schemas or templates!</p>
                        <div className="mt-2">
                          <p className="text-xs text-purple-500 font-medium">Your Vision:</p>
                          <p className="text-xs text-purple-700 italic">{gameLogic.userVision}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-lg text-gray-800">What You're Learning</h4>
                  {gameLogic.concepts.map((concept, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className="bg-funky-purple text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800">{concept.name}</h5>
                          <p className="text-sm text-gray-600 mt-1">{concept.description}</p>
                          {concept.examples.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Example:</p>
                              <p className="text-xs text-funky-purple italic">{concept.examples[0]}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Game Info */}
            <div className="bg-gradient-to-r from-panda-100 to-zamboo-100 rounded-xl p-4">
              <h4 className="font-bold text-gray-800 mb-2">Game Info</h4>
              <div className="space-y-2 text-sm">
                {isConceptFirstGame(gameLogic) ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generation:</span>
                      <span className="font-medium text-purple-600">🚀 Concept-First</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created By:</span>
                      <span className="font-medium">{gameLogic.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approach:</span>
                      <span className="font-medium text-purple-600">Experience-Driven</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="font-medium capitalize">{gameLogic.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age Group:</span>
                      <span className="font-medium">{gameLogic.ageGroup}</span>
                    </div>
                    {!isConceptFirstGame(gameLogic) && gameLogic.rules?.timer?.enabled && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Limit:</span>
                        <span className="font-medium">{gameLogic.rules.timer.duration}s</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameContainer