'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

interface ZambooLoaderGameProps {
  progress: number
  onGameComplete?: () => void
}

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  collected?: boolean
  animationOffset?: number
}

interface GameState {
  panda: {
    x: number
    y: number
    width: number
    height: number
    isJumping: boolean
    jumpVelocity: number
    animationFrame: number
    idleAnimation: number
  }
  bamboos: GameObject[]
  leaves: GameObject[]
  score: number
  collectedItems: number
  gameTime: number
  lastFrameTime: number
  backgroundOffset: number
}

const ZambooLoaderGame: React.FC<ZambooLoaderGameProps> = ({ progress, onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const keysPressed = useRef<Set<string>>(new Set())
  
  const [gameState, setGameState] = useState<GameState>({
    panda: { 
      x: 80, 
      y: 200, 
      width: 45, 
      height: 45, 
      isJumping: false, 
      jumpVelocity: 0,
      animationFrame: 0,
      idleAnimation: 0
    },
    bamboos: [],
    leaves: [],
    score: 0,
    collectedItems: 0,
    gameTime: 0,
    lastFrameTime: 0,
    backgroundOffset: 0
  })

  const CANVAS_WIDTH = 600
  const CANVAS_HEIGHT = 300
  const GRAVITY = 0.6
  const JUMP_STRENGTH = -14
  const GROUND_Y = 220
  const SCROLL_SPEED = 1.5 // Slower, more relaxed pace
  const TARGET_FPS = 60

  // Initialize game objects with better spacing
  useEffect(() => {
    const initBamboos: GameObject[] = []
    const initLeaves: GameObject[] = []

    // Create bamboos with better spacing and variety
    for (let i = 0; i < 12; i++) {
      initBamboos.push({
        x: CANVAS_WIDTH + i * 180 + Math.random() * 60,
        y: GROUND_Y - 25,
        width: 22,
        height: 25,
        collected: false,
        animationOffset: Math.random() * Math.PI * 2
      })
    }

    // Create leaves at different heights
    for (let i = 0; i < 16; i++) {
      const height = Math.random() < 0.5 ? 80 + Math.random() * 60 : 140 + Math.random() * 40
      initLeaves.push({
        x: CANVAS_WIDTH + i * 120 + Math.random() * 80,
        y: height,
        width: 18,
        height: 18,
        collected: false,
        animationOffset: Math.random() * Math.PI * 2
      })
    }

    setGameState(prev => ({
      ...prev,
      bamboos: initBamboos,
      leaves: initLeaves,
      lastFrameTime: performance.now()
    }))
  }, [])

  // Smooth keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code)
      e.preventDefault()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code)
      e.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Game logic with frame rate control
  const updateGame = useCallback((currentTime: number) => {
    const deltaTime = (currentTime - gameState.lastFrameTime) / 1000 // Convert to seconds
    const targetDelta = 1 / TARGET_FPS

    // Only update if enough time has passed (frame rate limiting)
    if (deltaTime < targetDelta) {
      return gameState
    }

    const newState = { ...gameState }
    newState.lastFrameTime = currentTime
    newState.gameTime += deltaTime
    newState.backgroundOffset = (newState.backgroundOffset + SCROLL_SPEED * deltaTime * 60) % CANVAS_WIDTH

    // Update panda animation
    newState.panda.idleAnimation += deltaTime * 3
    if (newState.panda.isJumping) {
      newState.panda.animationFrame += deltaTime * 8
    } else {
      newState.panda.animationFrame = Math.sin(newState.panda.idleAnimation) * 0.1
    }

    // Handle jump input
    if ((keysPressed.current.has('Space') || keysPressed.current.has('ArrowUp')) && !newState.panda.isJumping) {
      newState.panda.isJumping = true
      newState.panda.jumpVelocity = JUMP_STRENGTH
    }

    // Apply physics
    if (newState.panda.isJumping) {
      newState.panda.jumpVelocity += GRAVITY
      newState.panda.y += newState.panda.jumpVelocity

      // Land on ground
      if (newState.panda.y >= GROUND_Y) {
        newState.panda.y = GROUND_Y
        newState.panda.isJumping = false
        newState.panda.jumpVelocity = 0
      }
    }

    // Move objects smoothly
    const moveSpeed = SCROLL_SPEED * deltaTime * 60

    newState.bamboos = newState.bamboos.map(bamboo => ({
      ...bamboo,
      x: bamboo.x - moveSpeed
    })).filter(bamboo => bamboo.x > -50)

    newState.leaves = newState.leaves.map(leaf => ({
      ...leaf,
      x: leaf.x - moveSpeed
    })).filter(leaf => leaf.x > -50)

    // Add new objects when needed
    if (newState.bamboos.length < 12) {
      const lastBamboo = newState.bamboos[newState.bamboos.length - 1]
      const lastX = lastBamboo ? lastBamboo.x : CANVAS_WIDTH
      newState.bamboos.push({
        x: Math.max(lastX + 180 + Math.random() * 60, CANVAS_WIDTH + 100),
        y: GROUND_Y - 25,
        width: 22,
        height: 25,
        collected: false,
        animationOffset: Math.random() * Math.PI * 2
      })
    }

    if (newState.leaves.length < 16) {
      const lastLeaf = newState.leaves[newState.leaves.length - 1]
      const lastX = lastLeaf ? lastLeaf.x : CANVAS_WIDTH
      const height = Math.random() < 0.5 ? 80 + Math.random() * 60 : 140 + Math.random() * 40
      newState.leaves.push({
        x: Math.max(lastX + 120 + Math.random() * 80, CANVAS_WIDTH + 100),
        y: height,
        width: 18,
        height: 18,
        collected: false,
        animationOffset: Math.random() * Math.PI * 2
      })
    }

    // Collision detection with satisfying feedback
    const pandaRect = {
      x: newState.panda.x + 5,
      y: newState.panda.y + 5,
      width: newState.panda.width - 10,
      height: newState.panda.height - 10
    }

    const checkCollision = (obj: GameObject) => {
      return pandaRect.x < obj.x + obj.width - 5 &&
             pandaRect.x + pandaRect.width > obj.x + 5 &&
             pandaRect.y < obj.y + obj.height - 5 &&
             pandaRect.y + pandaRect.height > obj.y + 5
    }

    // Check bamboo collection
    newState.bamboos.forEach(bamboo => {
      if (!bamboo.collected && checkCollision(bamboo)) {
        bamboo.collected = true
        newState.score += 10
        newState.collectedItems += 1
      }
    })

    // Check leaf collection
    newState.leaves.forEach(leaf => {
      if (!leaf.collected && checkCollision(leaf)) {
        leaf.collected = true
        newState.score += 5
        newState.collectedItems += 1
      }
    })

    return newState
  }, [gameState])

  // Main game loop with proper timing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameLoop = (currentTime: number) => {
      const updatedState = updateGame(currentTime)
      setGameState(updatedState)

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      gradient.addColorStop(0, '#87CEEB') // Sky blue
      gradient.addColorStop(0.7, '#98E4FF') // Lighter blue
      gradient.addColorStop(1, '#B8E6B8') // Light green at bottom
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw animated background elements
      drawBackground(ctx, updatedState)
      
      // Draw game objects
      drawPanda(ctx, updatedState.panda, updatedState.gameTime)
      drawBamboos(ctx, updatedState.bamboos, updatedState.gameTime)
      drawLeaves(ctx, updatedState.leaves, updatedState.gameTime)
      
      // Draw ground with grass texture
      drawGround(ctx)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop(performance.now())

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [updateGame])

  const drawBackground = (ctx: CanvasRenderingContext2D, state: GameState) => {
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    for (let i = 0; i < 4; i++) {
      const cloudX = (i * 150 - state.backgroundOffset * 0.3) % (CANVAS_WIDTH + 100)
      const cloudY = 30 + Math.sin(state.gameTime + i) * 10
      drawCloud(ctx, cloudX, cloudY)
    }

    // Draw distant hills
    ctx.fillStyle = 'rgba(60, 179, 113, 0.6)'
    ctx.beginPath()
    ctx.moveTo(0, CANVAS_HEIGHT - 80)
    for (let x = 0; x <= CANVAS_WIDTH; x += 20) {
      const y = CANVAS_HEIGHT - 80 + Math.sin((x + state.backgroundOffset * 0.5) * 0.01) * 15
      ctx.lineTo(x, y)
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT)
    ctx.lineTo(0, CANVAS_HEIGHT)
    ctx.closePath()
    ctx.fill()
  }

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath()
    ctx.arc(x, y, 15, 0, Math.PI * 2)
    ctx.arc(x + 15, y, 20, 0, Math.PI * 2)
    ctx.arc(x + 30, y, 15, 0, Math.PI * 2)
    ctx.arc(x + 15, y - 10, 12, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    // Ground base
    ctx.fillStyle = '#228B22'
    ctx.fillRect(0, GROUND_Y + 25, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y - 25)
    
    // Grass texture
    ctx.strokeStyle = '#32CD32'
    ctx.lineWidth = 2
    for (let x = 0; x < CANVAS_WIDTH; x += 8) {
      const grassHeight = 5 + Math.random() * 8
      ctx.beginPath()
      ctx.moveTo(x, GROUND_Y + 25)
      ctx.lineTo(x + Math.random() * 2 - 1, GROUND_Y + 25 - grassHeight)
      ctx.stroke()
    }
  }

  const drawPanda = (ctx: CanvasRenderingContext2D, panda: typeof gameState.panda, gameTime: number) => {
    const centerX = panda.x + panda.width / 2
    const centerY = panda.y + panda.height / 2
    const bounce = Math.sin(gameTime * 4) * 2

    ctx.save()
    ctx.translate(centerX, centerY + bounce + panda.animationFrame)
    
    // Panda body (black)
    ctx.fillStyle = '#2C3E50'
    ctx.fillRect(-panda.width/2, -panda.height/2, panda.width, panda.height * 0.8)
    
    // Panda belly (white)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(-panda.width/3, -panda.height/3, panda.width * 0.66, panda.height * 0.5)
    
    // Panda head (white)
    ctx.beginPath()
    ctx.arc(0, -panda.height/2 - 5, 18, 0, Math.PI * 2)
    ctx.fill()
    
    // Panda ears (black)
    ctx.fillStyle = '#2C3E50'
    ctx.beginPath()
    ctx.arc(-12, -panda.height/2 - 15, 8, 0, Math.PI * 2)
    ctx.arc(12, -panda.height/2 - 15, 8, 0, Math.PI * 2)
    ctx.fill()
    
    // Panda eyes
    ctx.fillStyle = '#2C3E50'
    ctx.beginPath()
    ctx.arc(-6, -panda.height/2 - 8, 3, 0, Math.PI * 2)
    ctx.arc(6, -panda.height/2 - 8, 3, 0, Math.PI * 2)
    ctx.fill()
    
    // Eye shine
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(-5, -panda.height/2 - 7, 1, 0, Math.PI * 2)
    ctx.arc(7, -panda.height/2 - 7, 1, 0, Math.PI * 2)
    ctx.fill()
    
    // Panda nose
    ctx.fillStyle = '#2C3E50'
    ctx.beginPath()
    ctx.arc(0, -panda.height/2 - 2, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const drawBamboos = (ctx: CanvasRenderingContext2D, bamboos: GameObject[], gameTime: number) => {
    bamboos.forEach(bamboo => {
      if (bamboo.collected) return
      
      const sway = Math.sin(gameTime * 2 + (bamboo.animationOffset || 0)) * 2
      
      ctx.save()
      ctx.translate(bamboo.x + bamboo.width/2, bamboo.y + bamboo.height)
      ctx.rotate(sway * 0.1)
      
      // Bamboo stalk
      ctx.fillStyle = '#90EE90'
      ctx.fillRect(-bamboo.width/2, -bamboo.height, bamboo.width, bamboo.height)
      
      // Bamboo segments
      ctx.strokeStyle = '#228B22'
      ctx.lineWidth = 2
      for (let i = 1; i < 4; i++) {
        const y = -bamboo.height + (i * bamboo.height / 4)
        ctx.beginPath()
        ctx.moveTo(-bamboo.width/2, y)
        ctx.lineTo(bamboo.width/2, y)
        ctx.stroke()
      }
      
      // Bamboo leaves
      ctx.fillStyle = '#32CD32'
      ctx.beginPath()
      ctx.ellipse(-bamboo.width/3, -bamboo.height, 6, 12, -0.3, 0, Math.PI * 2)
      ctx.ellipse(bamboo.width/3, -bamboo.height + 5, 5, 10, 0.3, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })
  }

  const drawLeaves = (ctx: CanvasRenderingContext2D, leaves: GameObject[], gameTime: number) => {
    leaves.forEach(leaf => {
      if (leaf.collected) return
      
      const float = Math.sin(gameTime * 3 + (leaf.animationOffset || 0)) * 3
      const spin = gameTime + (leaf.animationOffset || 0)
      
      ctx.save()
      ctx.translate(leaf.x + leaf.width/2, leaf.y + leaf.height/2 + float)
      ctx.rotate(spin * 0.5)
      
      // Leaf shape
      ctx.fillStyle = '#32CD32'
      ctx.beginPath()
      ctx.ellipse(0, 0, leaf.width/2, leaf.height/2, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Leaf vein
      ctx.strokeStyle = '#228B22'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, -leaf.height/2)
      ctx.lineTo(0, leaf.height/2)
      ctx.stroke()
      
      // Leaf shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.beginPath()
      ctx.ellipse(-2, -2, 3, 5, -0.3, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-b from-blue-50 to-green-50 rounded-2xl shadow-lg">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-neutral-800 mb-3 font-display">
          🐼 Zamboo's Peaceful Garden
        </h3>
        <p className="text-neutral-600 mb-2">
          Help Zamboo collect bamboo 🎋 and leaves 🍃 while your amazing game is being created!
        </p>
        <p className="text-sm text-neutral-500">
          Press SPACE or ↑ to jump • Score: {gameState.score} • Collected: {gameState.collectedItems}
        </p>
      </div>

      <div className="relative mb-6">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-green-300 rounded-xl shadow-lg bg-gradient-to-b from-sky-200 to-green-200"
          tabIndex={0}
          style={{ outline: 'none' }}
        />
      </div>

      {/* Enhanced Progress Section */}
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-medium text-neutral-700">
            🎮 Creating your incredible game...
          </span>
          <span className="text-base font-bold text-duo-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-duo-green-500 via-duo-blue-500 to-duo-purple-500 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.max(progress, 5)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            <div className="absolute right-0 top-0 h-full w-1 bg-white opacity-60 animate-pulse"></div>
          </div>
        </div>
        
        <div className="text-center mt-3">
          <p className="text-sm text-neutral-600">
            {progress < 25 ? "🔨 Building game world..." : 
             progress < 50 ? "🎨 Adding colors and sprites..." :
             progress < 75 ? "⚙️ Programming game mechanics..." :
             progress < 95 ? "✨ Adding final polish..." :
             "🎉 Almost ready!"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ZambooLoaderGame