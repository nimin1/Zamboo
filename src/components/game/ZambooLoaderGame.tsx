'use client'

import React, { useEffect, useRef, useState } from 'react'

interface ZambooLoaderGameProps {
  progress: number
  onGameComplete?: () => void
}

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  speedX?: number
  collected?: boolean
}

interface GameState {
  panda: GameObject
  bamboos: GameObject[]
  leaves: GameObject[]
  obstacles: GameObject[]
  score: number
  lives: number
  isJumping: boolean
  jumpVelocity: number
  gameTime: number
}

const ZambooLoaderGame: React.FC<ZambooLoaderGameProps> = ({ progress, onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const keysPressed = useRef<Set<string>>(new Set())
  
  const [gameState, setGameState] = useState<GameState>({
    panda: { x: 50, y: 200, width: 40, height: 40 },
    bamboos: [],
    leaves: [],
    obstacles: [],
    score: 0,
    lives: 3,
    isJumping: false,
    jumpVelocity: 0,
    gameTime: 0
  })

  const CANVAS_WIDTH = 600
  const CANVAS_HEIGHT = 300
  const GRAVITY = 0.5
  const JUMP_STRENGTH = -12
  const GROUND_Y = 240
  const SCROLL_SPEED = 2

  // Initialize game objects
  useEffect(() => {
    const initBamboos = []
    const initLeaves = []
    const initObstacles = []

    // Create bamboos
    for (let i = 0; i < 5; i++) {
      initBamboos.push({
        x: CANVAS_WIDTH + i * 150,
        y: GROUND_Y - 20,
        width: 20,
        height: 20,
        collected: false
      })
    }

    // Create leaves
    for (let i = 0; i < 8; i++) {
      initLeaves.push({
        x: CANVAS_WIDTH + i * 100 + 50,
        y: Math.random() * 100 + 50,
        width: 15,
        height: 15,
        collected: false
      })
    }

    // Create obstacles
    for (let i = 0; i < 4; i++) {
      initObstacles.push({
        x: CANVAS_WIDTH + i * 200 + 100,
        y: GROUND_Y - 30,
        width: 30,
        height: 30
      })
    }

    setGameState(prev => ({
      ...prev,
      bamboos: initBamboos,
      leaves: initLeaves,
      obstacles: initObstacles
    }))
  }, [])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = () => {
      // Update game state
      setGameState(prevState => {
        const newState = { ...prevState }
        
        // Handle jump
        if ((keysPressed.current.has('Space') || keysPressed.current.has('ArrowUp')) && !newState.isJumping) {
          newState.isJumping = true
          newState.jumpVelocity = JUMP_STRENGTH
        }

        // Apply gravity and update panda position
        if (newState.isJumping) {
          newState.jumpVelocity += GRAVITY
          newState.panda.y += newState.jumpVelocity

          // Land on ground
          if (newState.panda.y >= GROUND_Y) {
            newState.panda.y = GROUND_Y
            newState.isJumping = false
            newState.jumpVelocity = 0
          }
        }

        // Move objects left (create scrolling effect)
        newState.bamboos = newState.bamboos.map(bamboo => ({
          ...bamboo,
          x: bamboo.x - SCROLL_SPEED
        })).filter(bamboo => bamboo.x > -50)

        newState.leaves = newState.leaves.map(leaf => ({
          ...leaf,
          x: leaf.x - SCROLL_SPEED
        })).filter(leaf => leaf.x > -50)

        newState.obstacles = newState.obstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - SCROLL_SPEED
        })).filter(obstacle => obstacle.x > -50)

        // Add new objects as old ones disappear
        if (newState.bamboos.length < 5) {
          const lastBamboo = newState.bamboos[newState.bamboos.length - 1]
          const lastX = lastBamboo ? lastBamboo.x : CANVAS_WIDTH
          newState.bamboos.push({
            x: lastX + 150,
            y: GROUND_Y - 20,
            width: 20,
            height: 20,
            collected: false
          })
        }

        if (newState.leaves.length < 8) {
          const lastLeaf = newState.leaves[newState.leaves.length - 1]
          const lastX = lastLeaf ? lastLeaf.x : CANVAS_WIDTH
          newState.leaves.push({
            x: lastX + 100,
            y: Math.random() * 100 + 50,
            width: 15,
            height: 15,
            collected: false
          })
        }

        if (newState.obstacles.length < 4) {
          const lastObstacle = newState.obstacles[newState.obstacles.length - 1]
          const lastX = lastObstacle ? lastObstacle.x : CANVAS_WIDTH
          newState.obstacles.push({
            x: lastX + 200,
            y: GROUND_Y - 30,
            width: 30,
            height: 30
          })
        }

        // Collision detection
        const checkCollision = (obj1: GameObject, obj2: GameObject) => {
          return obj1.x < obj2.x + obj2.width &&
                 obj1.x + obj1.width > obj2.x &&
                 obj1.y < obj2.y + obj2.height &&
                 obj1.y + obj1.height > obj2.y
        }

        // Check bamboo collection
        newState.bamboos.forEach(bamboo => {
          if (!bamboo.collected && checkCollision(newState.panda, bamboo)) {
            bamboo.collected = true
            newState.score += 10
          }
        })

        // Check leaf collection
        newState.leaves.forEach(leaf => {
          if (!leaf.collected && checkCollision(newState.panda, leaf)) {
            leaf.collected = true
            newState.score += 5
          }
        })

        // Check obstacle collision
        newState.obstacles.forEach(obstacle => {
          if (checkCollision(newState.panda, obstacle)) {
            newState.lives -= 1
            // Move panda back to avoid repeated collisions
            newState.panda.x = Math.max(30, newState.panda.x - 20)
          }
        })

        newState.gameTime += 1

        return newState
      })

      // Render game
      ctx.fillStyle = '#87CEEB' // Sky blue background
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw ground
      ctx.fillStyle = '#228B22' // Forest green
      ctx.fillRect(0, GROUND_Y + 40, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y - 40)

      // Draw trees in background
      ctx.fillStyle = '#006400' // Dark green
      for (let i = 0; i < 8; i++) {
        const treeX = (i * 100 - (gameState.gameTime * 0.5) % 800) % CANVAS_WIDTH
        ctx.fillRect(treeX, 50, 15, 200)
        ctx.beginPath()
        ctx.arc(treeX + 7.5, 50, 25, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw panda (Zamboo)
      const panda = gameState.panda
      ctx.fillStyle = '#000000' // Black for panda body
      ctx.fillRect(panda.x, panda.y, panda.width, panda.height)
      
      // Panda face
      ctx.fillStyle = '#FFFFFF' // White for face
      ctx.beginPath()
      ctx.arc(panda.x + panda.width/2, panda.y + 10, 15, 0, Math.PI * 2)
      ctx.fill()
      
      // Panda ears
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.arc(panda.x + 8, panda.y + 5, 6, 0, Math.PI * 2)
      ctx.arc(panda.x + panda.width - 8, panda.y + 5, 6, 0, Math.PI * 2)
      ctx.fill()

      // Eyes
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.arc(panda.x + 12, panda.y + 8, 2, 0, Math.PI * 2)
      ctx.arc(panda.x + panda.width - 12, panda.y + 8, 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw bamboos
      ctx.fillStyle = '#90EE90' // Light green
      gameState.bamboos.forEach(bamboo => {
        if (!bamboo.collected) {
          ctx.fillRect(bamboo.x, bamboo.y, bamboo.width, bamboo.height)
          // Bamboo segments
          ctx.strokeStyle = '#006400'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(bamboo.x, bamboo.y + 5)
          ctx.lineTo(bamboo.x + bamboo.width, bamboo.y + 5)
          ctx.moveTo(bamboo.x, bamboo.y + 10)
          ctx.lineTo(bamboo.x + bamboo.width, bamboo.y + 10)
          ctx.moveTo(bamboo.x, bamboo.y + 15)
          ctx.lineTo(bamboo.x + bamboo.width, bamboo.y + 15)
          ctx.stroke()
        }
      })

      // Draw leaves
      ctx.fillStyle = '#32CD32' // Lime green
      gameState.leaves.forEach(leaf => {
        if (!leaf.collected) {
          ctx.beginPath()
          ctx.ellipse(leaf.x + leaf.width/2, leaf.y + leaf.height/2, leaf.width/2, leaf.height/2, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Draw obstacles (rocks)
      ctx.fillStyle = '#696969' // Dark gray
      gameState.obstacles.forEach(obstacle => {
        ctx.beginPath()
        ctx.arc(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, obstacle.width/2, 0, Math.PI * 2)
        ctx.fill()
      })

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState.gameTime])

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-b from-blue-100 to-green-100 rounded-xl">
      <div className="mb-4 text-center">
        <h3 className="text-2xl font-bold text-neutral-800 mb-2 font-display">
          🐼 Zamboo's Forest Adventure!
        </h3>
        <p className="text-neutral-600 mb-2">
          Help Zamboo collect bamboo 🎋 and eat leaves 🍃 while avoiding rocks!
        </p>
        <p className="text-sm text-neutral-500">
          Press SPACE or ↑ to jump
        </p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-green-400 rounded-lg shadow-lg bg-white"
          tabIndex={0}
        />
        
        {/* Game stats overlay */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-lg p-2 text-sm font-semibold">
          <div className="flex items-center gap-4">
            <span className="text-green-600">🎋 Score: {gameState.score}</span>
            <span className="text-red-500">❤️ Lives: {gameState.lives}</span>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">
            🎮 Generating your awesome game...
          </span>
          <span className="text-sm font-bold text-duo-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-duo-green-500 to-duo-blue-500 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-neutral-500">
            Keep playing while your game loads! 🚀
          </p>
        </div>
      </div>
    </div>
  )
}

export default ZambooLoaderGame