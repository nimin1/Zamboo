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
  type?: 'leaf' | 'bamboo' | 'rock'
  points?: number
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
    isDead: boolean
    invulnerable: boolean
    invulnerabilityStart?: number
  }
  objects: GameObject[]
  score: number
  highScore: number
  lives: number
  gameTime: number
  lastFrameTime: number
  backgroundOffset: number
  gameOver: boolean
  restartTimer: number
  combo: number
  showCombo: boolean
  comboTime?: number
}

const ZambooLoaderGame: React.FC<ZambooLoaderGameProps> = ({ progress, onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const keysPressed = useRef<Set<string>>(new Set())
  
  const CANVAS_WIDTH = 600
  const CANVAS_HEIGHT = 300
  const GRAVITY = 0.6
  const JUMP_STRENGTH = -12  // Reduced for kid-friendly jumping
  const GROUND_Y = 220
  const SCROLL_SPEED = 1.5 // Reduced for kid-friendly pace!
  const TARGET_FPS = 60

  const [gameState, setGameState] = useState<GameState>({
    panda: { 
      x: 80, 
      y: GROUND_Y, 
      width: 45, 
      height: 45, 
      isJumping: false, 
      jumpVelocity: 0,
      animationFrame: 0,
      idleAnimation: 0,
      isDead: false,
      invulnerable: false
    },
    objects: [],
    score: 0,
    highScore: parseInt(localStorage.getItem('zambooLoaderHighScore') || '0'),
    lives: 3,
    gameTime: 0,
    lastFrameTime: 0,
    backgroundOffset: 0,
    gameOver: false,
    restartTimer: 0,
    combo: 0,
    showCombo: false
  })

  // Initialize exciting game with mixed objects
  const initializeGame = useCallback(() => {
    const initObjects: GameObject[] = []

    // Create initial mix of objects
    for (let i = 0; i < 20; i++) {
      const startX = CANVAS_WIDTH + i * (100 + Math.random() * 80)
      const objectType = Math.random()
      
      if (objectType < 0.4) {
        // Leaves (40% chance) - 1 point
        initObjects.push({
          x: startX,
          y: 50 + Math.random() * 120, // Floating leaves at various heights
          width: 20,
          height: 20,
          type: 'leaf',
          points: 1,
          collected: false,
          animationOffset: Math.random() * Math.PI * 2
        })
      } else if (objectType < 0.65) {
        // Bamboo trees (25% chance) - 5 points  
        initObjects.push({
          x: startX,
          y: GROUND_Y - 30,
          width: 25,
          height: 30,
          type: 'bamboo',
          points: 5,
          collected: false,
          animationOffset: Math.random() * Math.PI * 2
        })
      } else {
        // Rocks (35% chance) - Game over!
        const rockY = Math.random() < 0.7 ? GROUND_Y - 25 : GROUND_Y - 60 // Ground or elevated rocks
        initObjects.push({
          x: startX,
          y: rockY,
          width: 30,
          height: 25,
          type: 'rock',
          points: 0,
          collected: false,
          animationOffset: Math.random() * Math.PI * 2
        })
      }
    }

    return {
      objects: initObjects,
      lastFrameTime: performance.now()
    }
  }, [])

  // Restart game after death
  const restartGame = useCallback(() => {
    const initialData = initializeGame()
    setGameState(prev => ({
      ...prev,
      ...initialData,
      panda: {
        ...prev.panda,
        x: 80,
        y: GROUND_Y,
        isJumping: false,
        jumpVelocity: 0,
        isDead: false,
        invulnerable: false
      },
      score: 0,
      lives: 3,
      gameOver: false,
      restartTimer: 0,
      combo: 0,
      showCombo: false
    }))
  }, [initializeGame])

  useEffect(() => {
    const initialData = initializeGame()
    setGameState(prev => ({
      ...prev,
      ...initialData
    }))
  }, [initializeGame])

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

  // Exciting game logic with collision detection and game over
  const updateGame = useCallback((currentTime: number) => {
    const deltaTime = (currentTime - gameState.lastFrameTime) / 1000
    const targetDelta = 1 / TARGET_FPS

    if (deltaTime < targetDelta) {
      return gameState
    }

    const newState = { ...gameState }
    newState.lastFrameTime = currentTime
    newState.gameTime += deltaTime
    newState.backgroundOffset = (newState.backgroundOffset + SCROLL_SPEED * deltaTime * 60) % CANVAS_WIDTH

    // Handle game over state
    if (newState.gameOver) {
      newState.restartTimer += deltaTime
      if (newState.restartTimer > 3) { // Auto restart after 3 seconds
        restartGame()
        return newState
      }
      return newState
    }

    // Update invulnerability timer
    if (newState.panda.invulnerable && newState.panda.invulnerabilityStart) {
      if (newState.gameTime - newState.panda.invulnerabilityStart > 2) {
        newState.panda.invulnerable = false
      }
    }

    // Update combo display timer
    if (newState.showCombo && newState.comboTime) {
      if (newState.gameTime - newState.comboTime > 1.5) {
        newState.showCombo = false
      }
    }

    // Update panda animation
    newState.panda.idleAnimation += deltaTime * 3
    if (newState.panda.isJumping) {
      newState.panda.animationFrame += deltaTime * 8
    } else {
      newState.panda.animationFrame = Math.sin(newState.panda.idleAnimation) * 0.1
    }

    // Handle jump input (only if panda is alive)
    if (!newState.panda.isDead &&
        (keysPressed.current.has('Space') || keysPressed.current.has('ArrowUp')) && 
        !newState.panda.isJumping) {
      newState.panda.isJumping = true
      newState.panda.jumpVelocity = JUMP_STRENGTH
    }

    // Apply physics
    if (newState.panda.isJumping) {
      newState.panda.jumpVelocity += GRAVITY
      newState.panda.y += newState.panda.jumpVelocity

      if (newState.panda.y >= GROUND_Y) {
        newState.panda.y = GROUND_Y
        newState.panda.isJumping = false
        newState.panda.jumpVelocity = 0
      }
    }

    // Move and manage objects
    const moveSpeed = SCROLL_SPEED * deltaTime * 60
    newState.objects = newState.objects.map(obj => ({
      ...obj,
      x: obj.x - moveSpeed
    })).filter(obj => obj.x > -50)

    // Add new objects dynamically
    if (newState.objects.length < 20) {
      const lastObj = newState.objects[newState.objects.length - 1]
      const startX = lastObj ? Math.max(lastObj.x + 100 + Math.random() * 80, CANVAS_WIDTH + 50) : CANVAS_WIDTH + 50
      const objectType = Math.random()
      
      let newObject: GameObject
      if (objectType < 0.4) {
        // Leaf
        newObject = {
          x: startX,
          y: 50 + Math.random() * 120,
          width: 20,
          height: 20,
          type: 'leaf',
          points: 1,
          collected: false,
          animationOffset: Math.random() * Math.PI * 2
        }
      } else if (objectType < 0.65) {
        // Bamboo
        newObject = {
          x: startX,
          y: GROUND_Y - 30,
          width: 25,
          height: 30,
          type: 'bamboo',
          points: 5,
          collected: false,
          animationOffset: Math.random() * Math.PI * 2
        }
      } else {
        // Rock
        const rockY = Math.random() < 0.7 ? GROUND_Y - 25 : GROUND_Y - 60
        newObject = {
          x: startX,
          y: rockY,
          width: 30,
          height: 25,
          type: 'rock',
          points: 0,
          collected: false,
          animationOffset: Math.random() * Math.PI * 2
        }
      }
      newState.objects.push(newObject)
    }

    // Collision detection with improved logic
    if (!newState.panda.isDead && !newState.panda.invulnerable) {
      const pandaRect = {
        x: newState.panda.x + 5, // Slight margin for better gameplay
        y: newState.panda.y + 5,
        width: newState.panda.width - 10,
        height: newState.panda.height - 10
      }

      newState.objects.forEach(obj => {
        if (obj.collected) return

        const collision = 
          pandaRect.x < obj.x + obj.width &&
          pandaRect.x + pandaRect.width > obj.x &&
          pandaRect.y < obj.y + obj.height &&
          pandaRect.y + pandaRect.height > obj.y

        if (collision) {
          if (obj.type === 'rock') {
            // Hit a rock - lose a life!
            newState.panda.isDead = true
            newState.lives--
            newState.combo = 0
            
            if (newState.lives <= 0) {
              newState.gameOver = true
              newState.restartTimer = 0
              // Save high score
              if (newState.score > newState.highScore) {
                newState.highScore = newState.score
                localStorage.setItem('zambooLoaderHighScore', newState.score.toString())
              }
            } else {
              // Respawn with invulnerability
              setTimeout(() => {
                setGameState(prev => ({
                  ...prev,
                  panda: {
                    ...prev.panda,
                    isDead: false,
                    invulnerable: true,
                    invulnerabilityStart: prev.gameTime
                  }
                }))
              }, 500)
            }
            obj.collected = true
          } else {
            // Collect leaf or bamboo
            obj.collected = true
            newState.score += obj.points || 1
            newState.combo++
            
            if (newState.combo >= 5) {
              // Combo bonus!
              newState.score += Math.floor(newState.combo / 5) * 2
              newState.showCombo = true
              newState.comboTime = newState.gameTime
            }
          }
        }
      })
    }

    return newState
  }, [gameState, restartGame])

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

      // Draw scrolling clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      for (let i = 0; i < 3; i++) {
        const cloudX = (updatedState.backgroundOffset * 0.3 + i * 200) % (CANVAS_WIDTH + 100) - 50
        ctx.beginPath()
        ctx.arc(cloudX, 50 + i * 20, 25, 0, Math.PI * 2)
        ctx.arc(cloudX + 25, 50 + i * 20, 35, 0, Math.PI * 2)
        ctx.arc(cloudX + 50, 50 + i * 20, 25, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw ground
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(0, GROUND_Y + 45, CANVAS_WIDTH, 10)
      
      // Draw grass
      ctx.fillStyle = '#32CD32'
      ctx.fillRect(0, GROUND_Y + 45, CANVAS_WIDTH, 35)

      // Draw objects with exciting visuals
      updatedState.objects.forEach(obj => {
        if (obj.collected) return
        
        ctx.save()
        ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2)
        
        if (obj.type === 'leaf') {
          // Animated floating leaves
          const float = Math.sin(updatedState.gameTime * 2 + (obj.animationOffset || 0)) * 3
          ctx.translate(0, float)
          ctx.rotate(Math.sin(updatedState.gameTime + (obj.animationOffset || 0)) * 0.2)
          ctx.font = '20px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('🍃', 0, 5)
        } else if (obj.type === 'bamboo') {
          // Swaying bamboo
          ctx.rotate(Math.sin(updatedState.gameTime * 1.5 + (obj.animationOffset || 0)) * 0.1)
          ctx.font = '30px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('🎋', 0, 8)
        } else if (obj.type === 'rock') {
          // Menacing rocks with warning effect
          if (obj.x < 200) { // Warning when close
            ctx.shadowColor = 'red'
            ctx.shadowBlur = 10
          }
          const wobble = Math.sin(updatedState.gameTime * 8 + (obj.animationOffset || 0)) * 2
          ctx.translate(wobble, 0)
          ctx.font = '25px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('🪨', 0, 5)
          ctx.shadowBlur = 0
        }
        
        ctx.restore()
      })

      // Draw panda with death/invulnerability states
      ctx.save()
      ctx.translate(updatedState.panda.x + updatedState.panda.width/2, updatedState.panda.y + updatedState.panda.height/2)
      
      // Invulnerability flashing effect
      if (updatedState.panda.invulnerable) {
        ctx.globalAlpha = Math.sin(updatedState.gameTime * 20) > 0 ? 0.3 : 1.0
      }
      
      // Death effect
      if (updatedState.panda.isDead) {
        ctx.rotate(Math.PI) // Flip upside down
        ctx.globalAlpha = 0.5
      } else if (updatedState.panda.isJumping) {
        ctx.rotate(updatedState.panda.animationFrame * 0.1)
      } else {
        ctx.translate(0, updatedState.panda.animationFrame * 2)
      }
      
      ctx.font = '45px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🐼', 0, 10)
      ctx.restore()

      // Draw UI elements
      ctx.fillStyle = '#333'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${updatedState.score}`, 10, 25)
      ctx.fillText(`High: ${updatedState.highScore}`, 10, 45)
      ctx.fillText(`Lives: ${'❤️'.repeat(updatedState.lives)}`, 10, 65)

      // Draw combo
      if (updatedState.showCombo && updatedState.combo >= 5) {
        ctx.fillStyle = '#FF6B6B'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`${updatedState.combo}x COMBO!`, CANVAS_WIDTH/2, 50)
      }

      // Draw game over screen
      if (updatedState.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        
        ctx.fillStyle = '#FF4444'
        ctx.font = 'bold 32px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER!', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 40)
        
        ctx.fillStyle = '#FFF'
        ctx.font = '20px Arial'
        ctx.fillText(`Final Score: ${updatedState.score}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2)
        ctx.fillText(`High Score: ${updatedState.highScore}`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 25)
        ctx.fillText('Restarting in ' + Math.ceil(3 - updatedState.restartTimer) + '...', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 55)
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [updateGame])

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Game Title and Instructions */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-neutral-800 mb-2">🐼 Panda's Bamboo Adventure!</h3>
        <p className="text-sm text-neutral-600 mb-2">
          <strong>🎯 Goal:</strong> Collect 🍃 leaves (1pt) and 🎋 bamboo (5pts), avoid 🪨 rocks!
        </p>
        <p className="text-xs text-neutral-500">
          <strong>Controls:</strong> Press SPACE or ↑ to jump • Get 5+ combo for bonus points!
        </p>
      </div>

      {/* Game Canvas */}
      <div className="relative">
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
          <p className="text-sm text-neutral-600 font-medium">
            {progress < 10 ? "🌱 Planting the seeds of your game world..." : 
             progress < 20 ? "🏗️ Building the foundation and game structure..." :
             progress < 30 ? "🎨 Painting beautiful backgrounds and environments..." :
             progress < 40 ? "👾 Creating characters and bringing them to life..." :
             progress < 50 ? "⚡ Adding special powers and abilities..." :
             progress < 60 ? "🎵 Composing sound effects and music..." :
             progress < 70 ? "🔧 Programming game logic and interactions..." :
             progress < 80 ? "🌟 Adding sparkles, animations, and magic..." :
             progress < 90 ? "🎮 Testing gameplay and fine-tuning controls..." :
             progress < 95 ? "✨ Polishing every detail to perfection..." :
             "🎉 Your amazing game is ready to play!"}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {progress < 50 ? "Play the panda game above while we work! Avoid the rocks! 🐼" :
             progress < 90 ? "Almost there! Try to beat your high score! 🏆" :
             "Get ready for an amazing gaming experience! 🚀"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ZambooLoaderGame