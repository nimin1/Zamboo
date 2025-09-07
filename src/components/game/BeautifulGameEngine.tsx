'use client'

import React, { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import type { GameLogic, GameEngineRef } from '@/types'

interface BeautifulGameEngineProps {
  gameLogic: GameLogic
  width?: number
  height?: number
  onScoreChange?: (score: number) => void
  onGameComplete?: (won: boolean, finalScore: number) => void
  className?: string
}

interface GameObject {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  type: string
  visible: boolean
  vx: number
  vy: number
}

interface GameState {
  objects: Map<string, GameObject>
  player: GameObject | null
  score: number
  keys: { [key: string]: boolean }
  isRunning: boolean
  gameWon: boolean
  time: number
}

const BeautifulGameEngine = forwardRef<GameEngineRef, BeautifulGameEngineProps>(({
  gameLogic,
  width = 800,
  height = 600,
  onScoreChange,
  onGameComplete,
  className = ''
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const gameStateRef = useRef<GameState>({
    objects: new Map(),
    player: null,
    score: 0,
    keys: {},
    isRunning: false,
    gameWon: false,
    time: 0
  })

  // Expose game engine methods via ref  
  useImperativeHandle(ref, () => ({
    start: () => {
      gameStateRef.current.isRunning = true
      if (!animationRef.current) {
        lastTimeRef.current = performance.now()
        gameLoop()
      }
    },
    pause: () => {
      gameStateRef.current.isRunning = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    },
    resume: () => {
      gameStateRef.current.isRunning = true
      if (!animationRef.current) {
        lastTimeRef.current = performance.now()
        gameLoop()
      }
    },
    restart: () => {
      gameStateRef.current.score = 0
      gameStateRef.current.gameWon = false
      gameStateRef.current.time = 0
      gameStateRef.current.isRunning = true
      initializeGame()
      if (onScoreChange) onScoreChange(0)
    },
    destroy: () => {
      gameStateRef.current.isRunning = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    },
    getScore: () => gameStateRef.current.score,
    updateGameLogic: (newLogic: GameLogic) => {
      setIsInitialized(false)
    }
  }))

  // Parse color with fallbacks
  const parseColor = (colorInput: any): string => {
    if (typeof colorInput === 'string') {
      if (colorInput.startsWith('#')) return colorInput
      return `#${colorInput}`
    }
    return '#000000'
  }

  // Initialize game objects from gameLogic
  const initializeGame = useCallback(() => {
    const gameState = gameStateRef.current
    gameState.objects.clear()
    gameState.player = null
    gameState.score = 0
    gameState.gameWon = false
    gameState.time = 0

    console.log('🎮 Initializing BeautifulGameEngine with gameLogic:', gameLogic)

    // Ensure we have gameLogic and objects
    if (!gameLogic) {
      console.error('❌ No gameLogic provided to BeautifulGameEngine')
      return
    }

    if (!gameLogic.objects) {
      console.error('❌ No objects found in gameLogic:', gameLogic)
      return
    }

    // Create game objects
    gameLogic.objects.forEach((obj, index) => {
      const gameObj: GameObject = {
        id: obj.id || `object_${index}`,
        x: obj.position?.x || Math.random() * (width - 80) + 40,
        y: obj.position?.y || Math.random() * (height - 80) + 40,
        width: obj.size?.width || obj.sprite?.size?.width || 40,
        height: obj.size?.height || obj.sprite?.size?.height || 40,
        color: parseColor(obj.sprite?.color || obj.color || '#FF0000'),
        type: obj.type,
        visible: true,
        vx: 0,
        vy: 0
      }

      gameState.objects.set(gameObj.id, gameObj)

      if (obj.type === 'player') {
        gameState.player = gameObj
      }
    })

    console.log('🎮 BeautifulGameEngine initialized with', gameState.objects.size, 'objects')
    console.log('🎯 Player object:', gameState.player ? 'found' : 'not found')
    
    // Always set initialized to true after processing
    setIsInitialized(true)
  }, [gameLogic, width, height])

  // Game loop
  const gameLoop = useCallback(() => {
    const now = performance.now()
    const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 1/30)
    lastTimeRef.current = now

    const gameState = gameStateRef.current
    if (!gameState.isRunning || gameState.gameWon) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    // Update
    updateGame(deltaTime)
    
    // Render
    renderGame(ctx, canvas.width, canvas.height)

    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [])

  // Update game state
  const updateGame = (deltaTime: number) => {
    const gameState = gameStateRef.current
    if (!gameState.player) return

    const speed = 200
    
    // Handle input
    if (gameState.keys['ArrowLeft'] || gameState.keys['a']) {
      gameState.player.x -= speed * deltaTime
    }
    if (gameState.keys['ArrowRight'] || gameState.keys['d']) {
      gameState.player.x += speed * deltaTime
    }
    if (gameState.keys['ArrowUp'] || gameState.keys['w']) {
      gameState.player.y -= speed * deltaTime
    }
    if (gameState.keys['ArrowDown'] || gameState.keys['s']) {
      gameState.player.y += speed * deltaTime
    }

    // Keep player in bounds
    gameState.player.x = Math.max(0, Math.min(width - gameState.player.width, gameState.player.x))
    gameState.player.y = Math.max(0, Math.min(height - gameState.player.height, gameState.player.y))

    // Check collisions
    checkCollisions()

    gameState.time += deltaTime
  }

  // Check collisions
  const checkCollisions = () => {
    const gameState = gameStateRef.current
    if (!gameState.player) return

    gameState.objects.forEach(obj => {
      if (obj.id === gameState.player?.id || !obj.visible) return

      // Simple AABB collision
      if (gameState.player.x < obj.x + obj.width &&
          gameState.player.x + gameState.player.width > obj.x &&
          gameState.player.y < obj.y + obj.height &&
          gameState.player.y + gameState.player.height > obj.y) {
        
        if (obj.type === 'collectible') {
          obj.visible = false
          gameState.score += 10
          if (onScoreChange) onScoreChange(gameState.score)
          
          // Check if all collectibles collected
          const remainingCollectibles = Array.from(gameState.objects.values())
            .filter(o => o.type === 'collectible' && o.visible)
          
          if (remainingCollectibles.length === 0) {
            gameState.gameWon = true
            if (onGameComplete) onGameComplete(true, gameState.score)
          }
        } else if (obj.type === 'goal') {
          gameState.gameWon = true
          if (onGameComplete) onGameComplete(true, gameState.score)
        }
      }
    })
  }

  // Render game
  const renderGame = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
    if (gameLogic.background?.type === 'gradient' && gameLogic.background.colors?.length >= 2) {
      gradient.addColorStop(0, parseColor(gameLogic.background.colors[0]))
      gradient.addColorStop(1, parseColor(gameLogic.background.colors[1]))
    } else {
      const bgColor = gameLogic.background?.colors?.[0] || '#87CEEB'
      gradient.addColorStop(0, parseColor(bgColor))
      gradient.addColorStop(1, parseColor(bgColor))
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Render objects
    gameStateRef.current.objects.forEach(obj => {
      if (!obj.visible) return

      ctx.fillStyle = obj.color
      
      // Add nice rounded corners and shadows
      ctx.save()
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = obj.type === 'player' ? 8 : 4
      ctx.shadowOffsetY = 2

      if (obj.type === 'player') {
        // Player gets special treatment
        const gradient = ctx.createLinearGradient(obj.x, obj.y, obj.x, obj.y + obj.height)
        gradient.addColorStop(0, obj.color)
        gradient.addColorStop(1, '#CC0000')
        ctx.fillStyle = gradient
      } else if (obj.type === 'collectible') {
        // Collectibles shimmer
        const gradient = ctx.createRadialGradient(
          obj.x + obj.width/2, obj.y + obj.height/2, 0,
          obj.x + obj.width/2, obj.y + obj.height/2, Math.max(obj.width, obj.height)/2
        )
        gradient.addColorStop(0, obj.color)
        gradient.addColorStop(1, obj.color + '80')
        ctx.fillStyle = gradient
      } else if (obj.type === 'goal') {
        // Goals have checkered pattern for racing games
        if (gameLogic.title?.toLowerCase().includes('racing')) {
          const squareSize = 8
          for (let x = 0; x < obj.width; x += squareSize) {
            for (let y = 0; y < obj.height; y += squareSize) {
              ctx.fillStyle = (Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2 === 0 ? '#00FF00' : '#000000'
              ctx.fillRect(obj.x + x, obj.y + y, squareSize, squareSize)
            }
          }
          ctx.restore()
          return
        }
      }

      // Round rectangle
      const radius = Math.min(obj.width, obj.height) * 0.1
      ctx.beginPath()
      ctx.moveTo(obj.x + radius, obj.y)
      ctx.lineTo(obj.x + obj.width - radius, obj.y)
      ctx.quadraticCurveTo(obj.x + obj.width, obj.y, obj.x + obj.width, obj.y + radius)
      ctx.lineTo(obj.x + obj.width, obj.y + obj.height - radius)
      ctx.quadraticCurveTo(obj.x + obj.width, obj.y + obj.height, obj.x + obj.width - radius, obj.y + obj.height)
      ctx.lineTo(obj.x + radius, obj.y + obj.height)
      ctx.quadraticCurveTo(obj.x, obj.y + obj.height, obj.x, obj.y + obj.height - radius)
      ctx.lineTo(obj.x, obj.y + radius)
      ctx.quadraticCurveTo(obj.x, obj.y, obj.x + radius, obj.y)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    })

    // Render UI
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(10, 10, 200, 40)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '20px Arial'
    ctx.fillText(`Score: ${gameStateRef.current.score}`, 20, 35)
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Initialize and start game
  useEffect(() => {
    console.log('🚀 BeautifulGameEngine useEffect triggered')
    
    // Prevent double initialization
    if (gameStateRef.current.isRunning) {
      console.log('⚠️ Game already running, skipping initialization')
      return
    }
    
    initializeGame()
    
    // Start game loop only after a short delay to ensure state is set
    const startTimeout = setTimeout(() => {
      lastTimeRef.current = performance.now()
      gameStateRef.current.isRunning = true
      gameLoop()
    }, 100)

    return () => {
      clearTimeout(startTimeout)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      gameStateRef.current.isRunning = false
    }
  }, [gameLogic])

  // Render loading state
  if (!isInitialized) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading beautiful graphics...</p>
          <p className="text-gray-500 text-sm mt-2">
            {gameLogic ? `Processing ${gameLogic.objects?.length || 0} objects...` : 'Waiting for game data...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-xl shadow-2xl border-2 border-gray-200"
        style={{ 
          background: 'linear-gradient(45deg, #f0f9ff, #e0f2fe)',
          imageRendering: 'auto'
        }}
      />
      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium">
        Use Arrow Keys or WASD to move
      </div>
    </div>
  )
})

BeautifulGameEngine.displayName = 'BeautifulGameEngine'

export default BeautifulGameEngine