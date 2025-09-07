'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ZambooGameEngine, createZambooGame } from '../../zamboo-engine'
import { GameSpec } from '../../types/gamespec'
import { generateGameFromPrompt, DeepSeekGameRequest } from '../../deepseek'

interface ZambooPixiGameProps {
  prompt?: string
  kidAgeBand?: '4-6' | '7-9' | '10-12'
  gameSpec?: GameSpec
  onGameEnd?: (won: boolean, score: number) => void
}

export function ZambooPixiGame({ 
  prompt, 
  kidAgeBand = '7-9', 
  gameSpec, 
  onGameEnd 
}: ZambooPixiGameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<ZambooGameEngine | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameInfo, setGameInfo] = useState<{
    fps: number
    score: number
    isRunning: boolean
  }>({ fps: 0, score: 0, isRunning: false })

  useEffect(() => {
    let mounted = true

    const initGame = async () => {
      if (!containerRef.current) return

      try {
        setIsLoading(true)
        setError(null)

        let finalGameSpec: GameSpec

        if (gameSpec) {
          // Use provided GameSpec
          finalGameSpec = gameSpec
        } else if (prompt) {
          // Generate GameSpec from prompt
          console.log('🎮 Generating game from prompt:', prompt)
          
          const request: DeepSeekGameRequest = {
            prompt,
            kidAgeBand,
            complexity: 'normal'
          }

          const response = await generateGameFromPrompt(request)
          
          if (!response.success || !response.gameSpec) {
            throw new Error(response.error || 'Failed to generate game')
          }

          finalGameSpec = response.gameSpec
          console.log('✅ Generated GameSpec:', finalGameSpec)
        } else {
          throw new Error('Either prompt or gameSpec is required')
        }

        // Clean up any existing game
        if (engineRef.current) {
          engineRef.current.destroy()
          engineRef.current = null
        }

        if (!mounted) return

        // Create new game
        console.log('🚀 Creating PixiJS game with spec:', finalGameSpec.title)
        const engine = await createZambooGame(containerRef.current, finalGameSpec)
        
        if (!mounted) {
          engine.destroy()
          return
        }

        engineRef.current = engine
        setIsLoading(false)

        // Start performance monitoring
        const perfInterval = setInterval(() => {
          if (engineRef.current && mounted) {
            setGameInfo({
              fps: engineRef.current.getFPS(),
              score: engineRef.current.getScore(),
              isRunning: engineRef.current.isGameRunning()
            })
          }
        }, 1000)

        // Game end detection
        const checkGameEnd = () => {
          if (engineRef.current && !engineRef.current.isGameRunning()) {
            if (onGameEnd) {
              onGameEnd(true, engineRef.current.getScore()) // Simple win condition for now
            }
          }
        }

        const gameEndInterval = setInterval(checkGameEnd, 2000)

        // Cleanup function
        return () => {
          clearInterval(perfInterval)
          clearInterval(gameEndInterval)
        }

      } catch (err) {
        console.error('❌ Game initialization failed:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error occurred')
          setIsLoading(false)
        }
      }
    }

    initGame()

    return () => {
      mounted = false
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
      }
    }
  }, [prompt, kidAgeBand, gameSpec, onGameEnd])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // PixiJS handles resize automatically, but we might want to do something here
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const restartGame = async () => {
    if (engineRef.current) {
      engineRef.current.destroy()
      engineRef.current = null
    }
    setIsLoading(true)
    setError(null)
    
    // Trigger re-initialization
    window.location.reload() // Simple restart for now
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-50 rounded-2xl border-2 border-red-200">
        <div className="text-red-600 text-6xl mb-4">😵</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">Oops! Game Error</h3>
        <p className="text-red-600 text-center mb-4 max-w-md">
          {error}
        </p>
        <button
          onClick={restartGame}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-blue-50 rounded-2xl border-2 border-blue-200">
        <div className="animate-spin text-blue-600 text-6xl mb-4">🎮</div>
        <h3 className="text-xl font-bold text-blue-800 mb-2">Creating Your Game...</h3>
        <p className="text-blue-600 text-center">
          Zamboo is building something amazing for you!
        </p>
        <div className="mt-4 bg-blue-200 rounded-full h-2 w-48 overflow-hidden">
          <div className="bg-blue-500 h-full animate-pulse w-3/4 transition-all duration-1000"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Game Canvas Container */}
      <div 
        ref={containerRef}
        id="zamboo-canvas-root"
        className="w-full bg-black rounded-2xl overflow-hidden shadow-strong"
        style={{ 
          minHeight: '500px',
          aspectRatio: '4/3',
          maxWidth: '100%'
        }}
      />
      
      {/* Game Stats Overlay */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm font-mono">
        <div>FPS: {gameInfo.fps}</div>
        <div>Score: {gameInfo.score}</div>
        <div className={`w-2 h-2 rounded-full inline-block ml-2 ${
          gameInfo.isRunning ? 'bg-green-400' : 'bg-red-400'
        }`}></div>
      </div>
      
      {/* Game Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <span className="font-bold">🕹️</span>
            <span>Arrow Keys or Touch</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center space-x-1">
            <span className="font-bold">🚀</span>
            <span>Space to Jump</span>
          </div>
        </div>
      </div>

      {/* Restart Button */}
      <button
        onClick={restartGame}
        className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        title="Restart Game"
      >
        🔄 Restart
      </button>
    </div>
  )
}

export default ZambooPixiGame