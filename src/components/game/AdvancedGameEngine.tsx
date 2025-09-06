'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import type { GameLogic } from '@/types'

interface AdvancedGameEngineProps {
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
  rotation: number
  scale: number
  alpha: number
  points?: number
  collected?: boolean
  // Advanced visual properties from AI response
  material?: string
  glow?: boolean
  glowColor?: string
  trail?: {
    enabled: boolean
    color: string
    particleCount?: number
    length?: number
  }
  animations: {
    pulse?: { phase: number; speed: number }
    spin?: { speed: number }
    float?: { phase: number; amplitude: number; speed: number }
    sparkle?: { particles: Array<{ x: number; y: number; life: number; vx: number; vy: number; color: string }> }
    trail?: { positions: Array<{ x: number; y: number; alpha: number }> }
    glow?: { intensity: number; pulse: number }
  }
}

interface ParticleSystem {
  particles: Array<{
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    size: number
    color: string
    alpha: number
    rotation: number
    rotationSpeed: number
  }>
  emitRate: number
  lastEmit: number
}

export default function AdvancedGameEngine({
  gameLogic,
  width = 800,
  height = 600,
  onScoreChange,
  onGameComplete,
  className = ''
}: AdvancedGameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const gameStateRef = useRef({
    objects: new Map<string, GameObject>(),
    player: null as GameObject | null,
    score: 0,
    keys: {} as Record<string, boolean>,
    particles: [] as ParticleSystem[],
    effects: [] as Array<{
      type: string
      x: number
      y: number
      life: number
      maxLife: number
    }>,
    camera: { x: 0, y: 0 },
    time: 0
  })

  const createGameObject = (obj: any): GameObject => {
    // Safely extract color from sprite (handle both string and complex objects)
    const getColor = (sprite: any): string => {
      if (typeof sprite === 'string') return sprite
      if (typeof sprite === 'object' && sprite !== null) {
        // Try various common color properties
        if (typeof sprite.color === 'string') return sprite.color
        if (typeof sprite.primary === 'string') return sprite.primary
        if (typeof sprite.main === 'string') return sprite.main
        if (Array.isArray(sprite.colors) && sprite.colors.length > 0) return sprite.colors[0]
        // Default fallback colors based on object type
        if (obj.type === 'player') return '#4A90E2'
        if (obj.type === 'collectible') return '#FFD700'
        return '#888888'
      }
      return '#888888' // Ultimate fallback
    }

    const spriteColor = getColor(obj.sprite)
    
    return {
      id: obj.id,
      x: obj.position.x,
      y: obj.position.y,
      width: obj.size.width,
      height: obj.size.height,
      color: spriteColor,
      type: obj.type,
      visible: obj.visible !== false,
      vx: obj.velocity?.x || 0,
      vy: obj.velocity?.y || 0,
      rotation: 0,
      scale: 1,
      alpha: 1,
      points: typeof obj.points === 'number' ? obj.points : 10,
      collected: false,
      // Extract advanced visual properties from AI response
      material: obj.sprite?.material,
      glow: obj.sprite?.glow,
      glowColor: obj.sprite?.glowColor,
      trail: obj.sprite?.trail,
      animations: {
        pulse: obj.type === 'collectible' || obj.sprite?.glow ? { phase: Math.random() * Math.PI * 2, speed: 2 } : undefined,
        spin: obj.type === 'collectible' ? { speed: 1 } : undefined,
        float: obj.type === 'collectible' ? { phase: Math.random() * Math.PI * 2, amplitude: 10, speed: 1.5 } : undefined,
        sparkle: obj.type === 'collectible' ? { particles: [] } : undefined,
        trail: obj.type === 'player' || obj.sprite?.trail?.enabled ? { positions: [] } : undefined,
        glow: obj.sprite?.glow || spriteColor.includes('#FF') || spriteColor.includes('gold') || spriteColor.toLowerCase().includes('gold') ? { intensity: 20, pulse: 0 } : undefined
      }
    }
  }

  const initializeGame = useCallback(() => {
    const gameState = gameStateRef.current
    gameState.objects.clear()
    gameState.score = 0
    
    // Create game objects
    gameLogic.objects.forEach(obj => {
      const gameObj = createGameObject(obj)
      gameState.objects.set(obj.id, gameObj)
      
      if (obj.type === 'player') {
        gameState.player = gameObj
      }
    })

    // Initialize particle systems
    gameState.particles = [
      // Ambient particles
      {
        particles: [],
        emitRate: 0.3,
        lastEmit: 0
      },
      // Collision effects
      {
        particles: [],
        emitRate: 0,
        lastEmit: 0
      }
    ]

    onScoreChange?.(0)
  }, [gameLogic, onScoreChange])

  const updateAnimations = (obj: GameObject, deltaTime: number) => {
    gameStateRef.current.time += deltaTime

    // Pulse animation
    if (obj.animations.pulse) {
      obj.animations.pulse.phase += obj.animations.pulse.speed * deltaTime
      obj.scale = 1 + Math.sin(obj.animations.pulse.phase) * 0.1
    }

    // Spin animation
    if (obj.animations.spin) {
      obj.rotation += obj.animations.spin.speed * deltaTime
    }

    // Float animation
    if (obj.animations.float) {
      obj.animations.float.phase += obj.animations.float.speed * deltaTime
      const baseY = obj.y
      obj.y = baseY + Math.sin(obj.animations.float.phase) * obj.animations.float.amplitude
    }

    // Sparkle particles
    if (obj.animations.sparkle && obj.type === 'collectible') {
      // Add new sparkle particles
      if (Math.random() < 0.3) {
        obj.animations.sparkle.particles.push({
          x: obj.x + Math.random() * obj.width,
          y: obj.y + Math.random() * obj.height,
          life: 1,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          color: `hsl(${Math.random() * 60 + 40}, 100%, 70%)`
        })
      }

      // Update sparkle particles
      obj.animations.sparkle.particles = obj.animations.sparkle.particles.filter(particle => {
        particle.x += particle.vx * deltaTime
        particle.y += particle.vy * deltaTime
        particle.life -= deltaTime * 2
        return particle.life > 0
      })
    }

    // Trail effect for player
    if (obj.animations.trail && obj.type === 'player') {
      obj.animations.trail.positions.push({ x: obj.x + obj.width/2, y: obj.y + obj.height/2, alpha: 1 })
      if (obj.animations.trail.positions.length > 20) {
        obj.animations.trail.positions.shift()
      }
      
      // Fade trail
      obj.animations.trail?.positions.forEach((pos, i) => {
        pos.alpha = i / (obj.animations.trail?.positions.length || 1)
      })
    }

    // Glow effect
    if (obj.animations.glow) {
      obj.animations.glow.pulse += deltaTime * 3
      obj.animations.glow.intensity = 15 + Math.sin(obj.animations.glow.pulse) * 10
    }
  }

  const updateParticles = (deltaTime: number) => {
    const gameState = gameStateRef.current

    // Update ambient particles
    gameState.particles[0].lastEmit += deltaTime
    if (gameState.particles[0].lastEmit > 1 / gameState.particles[0].emitRate) {
      gameState.particles[0].particles.push({
        x: Math.random() * width,
        y: height + 10,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 50 - 10,
        life: 1,
        maxLife: 1,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 80%)`,
        alpha: 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2
      })
      gameState.particles[0].lastEmit = 0
    }

    // Update all particle systems
    gameState.particles.forEach(system => {
      system.particles = system.particles.filter(particle => {
        particle.x += particle.vx * deltaTime
        particle.y += particle.vy * deltaTime
        particle.life -= deltaTime
        particle.rotation += particle.rotationSpeed * deltaTime
        particle.alpha = particle.life / particle.maxLife
        return particle.life > 0 && particle.y > -50
      })
    })
  }

  const checkCollisions = () => {
    const gameState = gameStateRef.current
    if (!gameState.player) return

    const player = gameState.player
    
    gameState.objects.forEach(obj => {
      if (obj.id === player.id || !obj.visible || obj.collected) return

      // AABB collision detection
      if (player.x < obj.x + obj.width &&
          player.x + player.width > obj.x &&
          player.y < obj.y + obj.height &&
          player.y + player.height > obj.y) {
        
        if (obj.type === 'collectible') {
          // Collect item
          obj.collected = true
          obj.visible = false
          gameState.score += obj.points || 10
          onScoreChange?.(gameState.score)

          // Create collection effect
          gameState.effects.push({
            type: 'explosion',
            x: obj.x + obj.width/2,
            y: obj.y + obj.height/2,
            life: 1,
            maxLife: 1
          })

          // Add explosion particles
          for (let i = 0; i < 15; i++) {
            gameState.particles[1].particles.push({
              x: obj.x + obj.width/2,
              y: obj.y + obj.height/2,
              vx: (Math.random() - 0.5) * 200,
              vy: (Math.random() - 0.5) * 200,
              life: 0.8,
              maxLife: 0.8,
              size: Math.random() * 4 + 2,
              color: obj.color,
              alpha: 1,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 10
            })
          }
        } else if (obj.type === 'goal') {
          // Reached goal/finish line
          onGameComplete?.(true, gameState.score)
        }
      }
    })

    // Check win conditions based on game logic
    const hasGoals = Array.from(gameState.objects.values()).some(obj => obj.type === 'goal')
    
    if (!hasGoals) {
      // Collection-based game: win when all collectibles are collected
      const collectibles = Array.from(gameState.objects.values()).filter(obj => obj.type === 'collectible' && !obj.collected)
      if (collectibles.length === 0) {
        onGameComplete?.(true, gameState.score)
      }
    }
    // Goal-based games (like racing) are handled in collision detection above
  }

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    const bg = gameLogic.background

    // Safely get background colors (handle both arrays and objects)
    const getBackgroundColors = (bg: any): string[] => {
      if (Array.isArray(bg.colors)) return bg.colors
      if (Array.isArray(bg.color)) return bg.color
      if (typeof bg.color === 'string') return [bg.color]
      if (typeof bg.colors === 'string') return [bg.colors]
      // Dynamic theme-based colors
      if (bg.type && bg.type.toLowerCase().includes('forest')) return ['#1a5e1a', '#2d8f2d']
      if (bg.type && bg.type.toLowerCase().includes('neon')) return ['#000022', '#220066', '#4400AA']
      if (bg.type && bg.type.toLowerCase().includes('highway')) return ['#001122', '#003366', '#0066AA']
      if (bg.type && bg.type.toLowerCase().includes('cyberpunk')) return ['#0a0a2a', '#330066', '#ff00ff']
      // Default gradient colors
      return ['#87CEEB', '#98FB98']
    }

    const colors = getBackgroundColors(bg)
    const bgType = typeof bg.type === 'string' ? bg.type.toLowerCase() : 'gradient'
    const effects = bg.effects || []

    if (bgType === 'gradient' || bgType.includes('gradient')) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color)
      })
      ctx.fillStyle = gradient
    } else if (bgType === 'starfield' || bgType.includes('star')) {
      // Animated starfield
      ctx.fillStyle = '#000033'
      ctx.fillRect(0, 0, width, height)
      
      const time = gameStateRef.current.time
      for (let i = 0; i < 200; i++) {
        const x = (i * 123.456) % width
        const y = ((i * 78.901 + time * 20) % height)
        const brightness = Math.sin(i + time) * 0.5 + 0.5
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`
        ctx.fillRect(x, y, 1, 1)
      }
      return
    } else if (bgType.includes('highway') || bgType.includes('road') || bgType.includes('neon-highway')) {
      // Neon highway background for racing games
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, colors[0] || '#000022')
      gradient.addColorStop(0.5, colors[1] || '#220066') 
      gradient.addColorStop(1, colors[2] || '#4400AA')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Dynamic glowing road surface
      ctx.fillStyle = 'rgba(68, 0, 170, 0.3)'
      ctx.fillRect(0, height * 0.6, width, height * 0.4)
      
      // Highway lane markings with glow
      ctx.strokeStyle = '#00AAFF'
      ctx.lineWidth = 4
      ctx.shadowColor = '#00AAFF'
      ctx.shadowBlur = 10
      for (let i = 0; i < 10; i++) {
        const x = (i * width / 5 + gameStateRef.current.time * 3) % width
        ctx.beginPath()
        ctx.moveTo(x, height * 0.7)
        ctx.lineTo(x + 40, height * 0.7)
        ctx.stroke()
      }
      
      // Speed lines effect
      ctx.strokeStyle = 'rgba(0, 170, 255, 0.4)'
      ctx.lineWidth = 2
      for (let i = 0; i < 30; i++) {
        const x = (i * 123.456 + gameStateRef.current.time * 5) % width
        const y = height * 0.2 + (i % 3) * 100
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 60, y)
        ctx.stroke()
      }
      return
    } else if (bgType.includes('cyberpunk') || bgType.includes('city') || bgType.includes('neon')) {
      // Cyberpunk city background with neon effects
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, colors[0] || '#0a0a2a')
      gradient.addColorStop(0.5, colors[1] || '#330066')
      gradient.addColorStop(1, colors[2] || '#ff00ff')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Add holographic buildings
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)'
      for (let i = 0; i < 8; i++) {
        const buildingX = (i * width) / 7
        const buildingHeight = 150 + Math.sin(i + gameStateRef.current.time * 0.001) * 80
        const buildingWidth = 60 + Math.cos(i) * 20
        ctx.fillRect(buildingX, height - buildingHeight, buildingWidth, buildingHeight)
        
        // Neon strips on buildings
        ctx.fillStyle = i % 2 === 0 ? '#00ffff' : '#ff00ff'
        ctx.fillRect(buildingX + buildingWidth/4, height - buildingHeight/2, buildingWidth/2, 2)
        ctx.fillRect(buildingX + buildingWidth/4, height - buildingHeight/4, buildingWidth/2, 2)
      }
      
      // Data streams effect
      ctx.fillStyle = 'rgba(0, 255, 255, 0.3)'
      for (let i = 0; i < 20; i++) {
        const x = (i * 234.567 + gameStateRef.current.time * 2) % width
        const y = (i * 87.123) % height
        ctx.fillRect(x, y, 2, 20)
      }
      return
    } else if (bgType.includes('forest') || bgType.includes('nature')) {
      // Forest background with trees
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, colors[0] || '#87CEEB')
      gradient.addColorStop(1, colors[1] || '#1a5e1a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      
      // Add some simple tree silhouettes
      ctx.fillStyle = 'rgba(0, 50, 0, 0.3)'
      for (let i = 0; i < 10; i++) {
        const treeX = (i * width) / 9
        const treeHeight = 100 + Math.sin(i) * 50
        ctx.fillRect(treeX, height - treeHeight, 20, treeHeight)
      }
      return
    } else {
      ctx.fillStyle = colors[0] || '#87CEEB'
    }
    
    ctx.fillRect(0, 0, width, height)
  }

  const drawGameObject = (ctx: CanvasRenderingContext2D, obj: GameObject) => {
    if (!obj.visible) return

    ctx.save()
    ctx.globalAlpha = obj.alpha
    ctx.translate(obj.x + obj.width/2, obj.y + obj.height/2)
    ctx.rotate(obj.rotation)
    ctx.scale(obj.scale, obj.scale)

    // Draw glow effect
    if (obj.animations.glow) {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.animations.glow.intensity)
      gradient.addColorStop(0, obj.color + '80')
      gradient.addColorStop(1, obj.color + '00')
      ctx.fillStyle = gradient
      ctx.fillRect(-obj.width, -obj.height, obj.width * 2, obj.height * 2)
    }

    // Draw trail
    if (obj.animations.trail) {
      ctx.globalCompositeOperation = 'lighter'
      obj.animations.trail.positions.forEach((pos, i) => {
        ctx.globalAlpha = pos.alpha * 0.3
        ctx.fillStyle = obj.color
        ctx.fillRect(pos.x - obj.x - obj.width/2 - 2, pos.y - obj.y - obj.height/2 - 2, 4, 4)
      })
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = obj.alpha
    }

    // Draw main object based on sprite type
    ctx.fillStyle = obj.color
    
    // Get sprite type safely (handle complex sprite objects) - DYNAMIC THEME DETECTION
    const originalObj = gameLogic.objects.find(o => o.id === obj.id)
    const getSpriteType = (sprite: any): string => {
      if (typeof sprite === 'string') return sprite
      if (typeof sprite === 'object' && sprite !== null) {
        if (typeof sprite.type === 'string') return sprite.type
        if (typeof sprite.shape === 'string') return sprite.shape
        if (typeof sprite.form === 'string') return sprite.form
      }
      return 'rectangle' // Default fallback
    }
    
    const spriteType = originalObj?.sprite ? getSpriteType(originalObj.sprite) : 'rectangle'
    const lowerType = spriteType.toLowerCase()
    
    // 🎨 ADAPTIVE THEME DETECTION - Analyze the entire game for theme context
    const gameTheme = detectGameTheme()
    
    function detectGameTheme(): string {
      const bgType = gameLogic.background?.type?.toLowerCase() || ''
      const gameTitle = gameLogic.title?.toLowerCase() || ''
      const gameDesc = gameLogic.description?.toLowerCase() || ''
      
      // Combine all context for theme detection
      const fullContext = (bgType + ' ' + gameTitle + ' ' + gameDesc + ' ' + lowerType).toLowerCase()
      
      // More specific theme detection - require stronger indicators for cyberpunk theme
      if (fullContext.includes('cyberpunk') || fullContext.includes('neon-highway') || (fullContext.includes('neon') && fullContext.includes('racing'))) return 'cyberpunk-racing'
      if (fullContext.includes('forest') || fullContext.includes('nature') || fullContext.includes('tree')) return 'nature'
      if (fullContext.includes('space') || fullContext.includes('cosmic') || fullContext.includes('galaxy') || fullContext.includes('starfield')) return 'space'
      if (fullContext.includes('underwater') || fullContext.includes('ocean') || fullContext.includes('sea')) return 'underwater'
      if (fullContext.includes('medieval') || fullContext.includes('castle') || fullContext.includes('magic')) return 'fantasy'
      if (fullContext.includes('candy') || fullContext.includes('sweet') || fullContext.includes('dessert')) return 'candy'
      
      return 'modern'
    }
    
    // 🚀 REVOLUTIONARY HIGH-END GRAPHICS ENGINE - SUPPORTS ALL AI-GENERATED TYPES!
    
    // Advanced material rendering
    const material = originalObj?.sprite?.material || 'standard'
    
    if (material === 'holographic') {
      // Holographic material with rainbow shimmer
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.width/2)
      const hue = (gameStateRef.current.time * 50) % 360
      gradient.addColorStop(0, `hsl(${hue}, 100%, 80%)`)
      gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 100%, 60%)`)
      gradient.addColorStop(1, `hsl(${(hue + 120) % 360}, 100%, 40%)`)
      ctx.fillStyle = gradient
    } else if (material === 'plasma') {
      // Plasma material with energy effects
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.width/2)
      gradient.addColorStop(0, obj.color + 'FF')
      gradient.addColorStop(0.3, obj.color + 'CC')
      gradient.addColorStop(0.7, obj.color + '66')
      gradient.addColorStop(1, obj.color + '00')
      ctx.fillStyle = gradient
    } else if (material === 'neon') {
      // Neon material with outer glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.width)
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(0.1, obj.color)
      gradient.addColorStop(0.5, obj.color + 'AA')
      gradient.addColorStop(1, obj.color + '00')
      ctx.fillStyle = gradient
    } else {
      ctx.fillStyle = obj.color
    }
    
    // Enhanced glow effect for high-end graphics
    if (obj.glow || obj.glowColor) {
      ctx.save()
      ctx.shadowColor = obj.glowColor || obj.color
      ctx.shadowBlur = 20
      ctx.globalCompositeOperation = 'lighter'
      // Draw glow halo
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(obj.width, obj.height))
      gradient.addColorStop(0, (obj.glowColor || obj.color) + '88')
      gradient.addColorStop(0.5, (obj.glowColor || obj.color) + '44')
      gradient.addColorStop(1, (obj.glowColor || obj.color) + '00')
      ctx.fillStyle = gradient
      ctx.fillRect(-obj.width * 2, -obj.height * 2, obj.width * 4, obj.height * 4)
      ctx.restore()
    }
    
    // 🎨 DYNAMIC THEME-AWARE SPRITE RENDERING - Adapts to ANY AI theme!
    // First check for explicit sprite types, then use theme context
    if (lowerType.includes('car') || lowerType.includes('vehicle') || lowerType.includes('racer') || lowerType.includes('hovercar') || 
        (obj.type === 'player' && gameTheme === 'cyberpunk-racing')) {
      
      // ADVANCED 3D-STYLE CAR RENDERING
      ctx.save()
      
      // Draw realistic car with multiple layers and details
      const carWidth = obj.width
      const carHeight = obj.height
      
      // Car shadow (for 3D effect)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.ellipse(2, carHeight/3, carWidth/2 + 2, carHeight/4, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Main car body with advanced gradient
      const bodyGradient = ctx.createLinearGradient(0, -carHeight/2, 0, carHeight/2)
      bodyGradient.addColorStop(0, obj.color)
      bodyGradient.addColorStop(0.3, obj.color + 'CC')
      bodyGradient.addColorStop(0.7, obj.color + '88')
      bodyGradient.addColorStop(1, obj.color + '44')
      ctx.fillStyle = bodyGradient
      
      // Advanced car body shape
      ctx.beginPath()
      ctx.moveTo(-carWidth/2 + 4, carHeight/2)  // Bottom left, rounded
      ctx.lineTo(-carWidth/2 + 2, carHeight/4)   // Left side
      ctx.lineTo(-carWidth/2, 0)                 // Left middle
      ctx.lineTo(-carWidth/2 + 4, -carHeight/3)  // Left roof start
      ctx.lineTo(-carWidth/3, -carHeight/2)      // Roof left
      ctx.lineTo(carWidth/3, -carHeight/2)       // Roof right  
      ctx.lineTo(carWidth/2 - 4, -carHeight/3)   // Right roof start
      ctx.lineTo(carWidth/2, 0)                  // Right middle
      ctx.lineTo(carWidth/2 - 2, carHeight/4)    // Right side
      ctx.lineTo(carWidth/2 - 4, carHeight/2)    // Bottom right, rounded
      ctx.closePath()
      ctx.fill()
      
      // Car windshield (realistic glass effect)
      const windshieldGradient = ctx.createLinearGradient(0, -carHeight/2, 0, -carHeight/4)
      windshieldGradient.addColorStop(0, 'rgba(135, 206, 235, 0.8)')  // Sky blue reflection
      windshieldGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)')  // Glass reflection
      windshieldGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)')          // Interior shadow
      ctx.fillStyle = windshieldGradient
      ctx.beginPath()
      ctx.moveTo(-carWidth/3 + 2, -carHeight/2 + 2)
      ctx.lineTo(carWidth/3 - 2, -carHeight/2 + 2)
      ctx.lineTo(carWidth/2 - 6, -carHeight/3 + 2)
      ctx.lineTo(-carWidth/2 + 6, -carHeight/3 + 2)
      ctx.closePath()
      ctx.fill()
      
      // Car wheels with 3D effect
      const wheelRadius = Math.min(carHeight/4, 8)
      const wheelPositions = [
        [-carWidth/3, carHeight/3],    // Front left
        [carWidth/3, carHeight/3],     // Front right
        [-carWidth/3, -carHeight/4],   // Rear left  
        [carWidth/3, -carHeight/4]     // Rear right
      ]
      
      wheelPositions.forEach(([wheelX, wheelY]) => {
        // Wheel shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.beginPath()
        ctx.arc(wheelX + 1, wheelY + 1, wheelRadius + 1, 0, Math.PI * 2)
        ctx.fill()
        
        // Wheel rim (metallic effect)
        const rimGradient = ctx.createRadialGradient(wheelX, wheelY, 0, wheelX, wheelY, wheelRadius)
        rimGradient.addColorStop(0, '#CCCCCC')
        rimGradient.addColorStop(0.7, '#888888')
        rimGradient.addColorStop(1, '#444444')
        ctx.fillStyle = rimGradient
        ctx.beginPath()
        ctx.arc(wheelX, wheelY, wheelRadius, 0, Math.PI * 2)
        ctx.fill()
        
        // Wheel center (chrome effect)
        const centerGradient = ctx.createRadialGradient(wheelX, wheelY, 0, wheelX, wheelY, wheelRadius/2)
        centerGradient.addColorStop(0, '#FFFFFF')
        centerGradient.addColorStop(0.5, '#DDDDDD')
        centerGradient.addColorStop(1, '#AAAAAA')
        ctx.fillStyle = centerGradient
        ctx.beginPath()
        ctx.arc(wheelX, wheelY, wheelRadius/2, 0, Math.PI * 2)
        ctx.fill()
        
        // Wheel spokes
        ctx.strokeStyle = '#666666'
        ctx.lineWidth = 1
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5
          ctx.beginPath()
          ctx.moveTo(wheelX, wheelY)
          ctx.lineTo(wheelX + Math.cos(angle) * wheelRadius/2, wheelY + Math.sin(angle) * wheelRadius/2)
          ctx.stroke()
        }
      })
      
      // Car headlights (bright realistic lights)
      const headlightPositions = [
        [-carWidth/2 + 2, -carHeight/6],
        [carWidth/2 - 2, -carHeight/6]
      ]
      
      headlightPositions.forEach(([lightX, lightY]) => {
        // Headlight glow
        const lightGradient = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, 8)
        lightGradient.addColorStop(0, 'rgba(255, 255, 200, 1)')
        lightGradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.6)')
        lightGradient.addColorStop(1, 'rgba(255, 255, 200, 0)')
        ctx.fillStyle = lightGradient
        ctx.beginPath()
        ctx.arc(lightX, lightY, 8, 0, Math.PI * 2)
        ctx.fill()
        
        // Headlight lens
        ctx.fillStyle = '#FFFFCC'
        ctx.beginPath()
        ctx.arc(lightX, lightY, 3, 0, Math.PI * 2)
        ctx.fill()
      })
      
      // Car racing stripes or details (if it's a racing car)
      if (gameLogic.title?.toLowerCase().includes('racing') || obj.glow) {
        ctx.strokeStyle = obj.glowColor || '#FFFFFF'
        ctx.lineWidth = 2
        ctx.shadowColor = obj.glowColor || '#FFFFFF'
        ctx.shadowBlur = 4
        
        // Racing stripes down the center
        ctx.beginPath()
        ctx.moveTo(-2, -carHeight/2 + 4)
        ctx.lineTo(-2, carHeight/2 - 4)
        ctx.moveTo(2, -carHeight/2 + 4)
        ctx.lineTo(2, carHeight/2 - 4)
        ctx.stroke()
        
        // Reset shadow
        ctx.shadowBlur = 0
      }
      
      ctx.restore()
      
    } else if (lowerType.includes('girl') || lowerType.includes('character') || lowerType.includes('person') || obj.type === 'player') {
      // ADVANCED CHARACTER RENDERING
      ctx.save()
      
      const charWidth = obj.width
      const charHeight = obj.height
      
      // Character shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.ellipse(1, charHeight/2 - 2, charWidth/3, charHeight/8, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Head with realistic shading
      const headRadius = charWidth/3
      const headGradient = ctx.createRadialGradient(-headRadius/3, -charHeight/3, 0, 0, -charHeight/3, headRadius)
      headGradient.addColorStop(0, obj.color)
      headGradient.addColorStop(0.7, obj.color + 'CC')
      headGradient.addColorStop(1, obj.color + '88')
      ctx.fillStyle = headGradient
      ctx.beginPath()
      ctx.arc(0, -charHeight/3, headRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Hair/hat
      ctx.fillStyle = obj.color + '66'
      ctx.beginPath()
      ctx.arc(0, -charHeight/3 - 2, headRadius + 2, Math.PI, Math.PI * 2)
      ctx.fill()
      
      // Eyes
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.arc(-headRadius/3, -charHeight/3 - 2, 2, 0, Math.PI * 2)
      ctx.arc(headRadius/3, -charHeight/3 - 2, 2, 0, Math.PI * 2)
      ctx.fill()
      
      // Eye highlights
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(-headRadius/3 + 1, -charHeight/3 - 3, 1, 0, Math.PI * 2)
      ctx.arc(headRadius/3 + 1, -charHeight/3 - 3, 1, 0, Math.PI * 2)
      ctx.fill()
      
      // Smile
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, -charHeight/3 + 3, headRadius/3, 0, Math.PI)
      ctx.stroke()
      
      // Body with clothing details
      const bodyGradient = ctx.createLinearGradient(0, -charHeight/6, 0, charHeight/3)
      bodyGradient.addColorStop(0, obj.color + 'EE')
      bodyGradient.addColorStop(0.5, obj.color + 'BB')
      bodyGradient.addColorStop(1, obj.color + '88')
      ctx.fillStyle = bodyGradient
      ctx.beginPath()
      if (ctx.roundRect) {
        ctx.roundRect(-charWidth/4, -charHeight/6, charWidth/2, charHeight/2, 4)
      } else {
        ctx.rect(-charWidth/4, -charHeight/6, charWidth/2, charHeight/2)
      }
      ctx.fill()
      
      // Arms with movement
      const armOffset = Math.sin(gameStateRef.current.time * 0.003) * 0.2
      ctx.fillStyle = obj.color + 'DD'
      
      // Left arm
      ctx.save()
      ctx.translate(-charWidth/3, -charHeight/12)
      ctx.rotate(armOffset)
      if (ctx.roundRect) {
        ctx.roundRect(-2, 0, 4, charHeight/3, 2)
      } else {
        ctx.rect(-2, 0, 4, charHeight/3)
      }
      ctx.fill()
      ctx.restore()
      
      // Right arm  
      ctx.save()
      ctx.translate(charWidth/3, -charHeight/12)
      ctx.rotate(-armOffset)
      if (ctx.roundRect) {
        ctx.roundRect(-2, 0, 4, charHeight/3, 2)
      } else {
        ctx.rect(-2, 0, 4, charHeight/3)
      }
      ctx.fill()
      ctx.restore()
      
      // Legs with walking animation
      const legOffset = Math.sin(gameStateRef.current.time * 0.004) * 0.3
      ctx.fillStyle = obj.color + 'AA'
      
      // Left leg
      ctx.save()
      ctx.translate(-charWidth/6, charHeight/4)
      ctx.rotate(legOffset)
      if (ctx.roundRect) {
        ctx.roundRect(-3, 0, 6, charHeight/4, 3)
      } else {
        ctx.rect(-3, 0, 6, charHeight/4)
      }
      ctx.fill()
      ctx.restore()
      
      // Right leg
      ctx.save()
      ctx.translate(charWidth/6, charHeight/4)
      ctx.rotate(-legOffset)
      if (ctx.roundRect) {
        ctx.roundRect(-3, 0, 6, charHeight/4, 3)
      } else {
        ctx.rect(-3, 0, 6, charHeight/4)
      }
      ctx.fill()
      ctx.restore()
      
      // Shoes
      ctx.fillStyle = '#000000'
      const shoeOffset1 = Math.sin(gameStateRef.current.time * 0.004) * 2
      const shoeOffset2 = Math.sin(gameStateRef.current.time * 0.004 + Math.PI) * 2
      ctx.beginPath()
      ctx.ellipse(-charWidth/6 + shoeOffset1, charHeight/2 - 2, 4, 2, 0, 0, Math.PI * 2)
      ctx.ellipse(charWidth/6 + shoeOffset2, charHeight/2 - 2, 4, 2, 0, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    } else if (lowerType.includes('magical') || lowerType.includes('energy') || lowerType.includes('orb') || 
               (obj.type === 'collectible' && (gameTheme === 'cyberpunk-racing' || gameTheme === 'space'))) {
      
      // Theme-adaptive energy/magical orb rendering
      if (gameTheme === 'cyberpunk-racing') {
        // Cyberpunk energy cell/boost orb
        const pulseIntensity = Math.sin(gameStateRef.current.time * 0.005) * 0.3 + 0.7
        
        // Core energy sphere
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.width/2)
        coreGradient.addColorStop(0, (obj.glowColor || obj.color) + 'FF')
        coreGradient.addColorStop(0.3, (obj.glowColor || obj.color) + 'CC')
        coreGradient.addColorStop(1, (obj.glowColor || obj.color) + '00')
        ctx.fillStyle = coreGradient
        
        ctx.beginPath()
        ctx.arc(0, 0, obj.width/2 * pulseIntensity, 0, Math.PI * 2)
        ctx.fill()
        
        // Data stream rings
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = (obj.glowColor || obj.color) + Math.floor(128 * pulseIntensity).toString(16).padStart(2, '0')
          ctx.lineWidth = 2
          ctx.beginPath()
          const ringRadius = obj.width/3 + i * 8
          const rotation = gameStateRef.current.time * 0.001 * (i + 1) 
          
          for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
            const x = Math.cos(angle + rotation) * ringRadius
            const y = Math.sin(angle + rotation) * ringRadius
            if (angle === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
        
      } else {
        // Standard magical orb with rotating energy rings
        ctx.beginPath()
        ctx.arc(0, 0, obj.width/2, 0, Math.PI * 2)
        ctx.fill()
        
        // Energy rings
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = obj.color + '66'
          ctx.lineWidth = 2
          ctx.beginPath()
          const ringRadius = obj.width/2 + (i * 8) + Math.sin(gameStateRef.current.time * (i + 1)) * 4
          ctx.arc(0, 0, ringRadius, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    } else if (lowerType.includes('crystal') || lowerType.includes('gem') || lowerType.includes('diamond')) {
      // Crystal/gem with faceted appearance
      ctx.beginPath()
      const sides = 8
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides
        const radius = obj.width/2 + Math.sin(angle * 2) * 4
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
    } else if (lowerType.includes('berry') || lowerType.includes('fruit')) {
      // Berry/fruit with organic bumpy shape
      ctx.beginPath()
      const bumps = 6
      for (let i = 0; i < bumps; i++) {
        const angle = (i * 2 * Math.PI) / bumps
        const radius = obj.width/2 + Math.sin(i * 3) * 3
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(x, y)
        else {
          const controlRadius = radius * 1.2
          const controlX = Math.cos(angle - 0.5) * controlRadius
          const controlY = Math.sin(angle - 0.5) * controlRadius
          ctx.quadraticCurveTo(controlX, controlY, x, y)
        }
      }
      ctx.closePath()
      ctx.fill()
    } else if (lowerType.includes('star') || lowerType.includes('cosmic') || obj.type === 'collectible') {
      // Enhanced star with dynamic points
      ctx.beginPath()
      const points = 8
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points
        const radius = i % 2 === 0 ? obj.width / 2 : obj.width / 3
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.fill()
    } else if (lowerType.includes('tree') || lowerType.includes('forest')) {
      // Tree with organic trunk and crown
      ctx.fillRect(-obj.width/6, 0, obj.width/3, obj.height/3) // Trunk
      ctx.beginPath()
      ctx.arc(0, -obj.height/4, obj.width/2, 0, Math.PI * 2) // Crown
      ctx.fill()
    } else if (lowerType.includes('cloud') || lowerType.includes('nebula')) {
      // Cloud with soft organic shape
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const radius = obj.width/3 + Math.sin(i * 2 + gameStateRef.current.time) * 5
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        ctx.arc(x, y, obj.width/4, 0, Math.PI * 2)
      }
      ctx.fill()
    } else if (lowerType.includes('heart') || lowerType.includes('love')) {
      // Enhanced heart shape
      ctx.beginPath()
      ctx.moveTo(0, obj.height/4)
      ctx.bezierCurveTo(-obj.width/2, -obj.height/2, -obj.width/2, obj.height/4, 0, obj.height/2)
      ctx.bezierCurveTo(obj.width/2, obj.height/4, obj.width/2, -obj.height/2, 0, obj.height/4)
      ctx.fill()
    } else {
      // 🌟 UNIVERSAL ADAPTIVE RENDERING - Handles ANY AI-generated sprite type!
      // This analyzes the sprite type and game context to create appropriate visuals
      
      if (gameTheme === 'cyberpunk-racing') {
        // Cyberpunk-themed rendering for any object
        if (obj.type === 'obstacle') {
          // Cyber obstacles - angular barriers with neon
          ctx.beginPath()
          ctx.moveTo(-obj.width/2, -obj.height/2)
          ctx.lineTo(obj.width/2, -obj.height/4)
          ctx.lineTo(obj.width/2, obj.height/2)
          ctx.lineTo(-obj.width/2, obj.height/4)
          ctx.closePath()
          ctx.fill()
          
          // Neon outline
          if (obj.glow) {
            ctx.strokeStyle = obj.glowColor || obj.color
            ctx.lineWidth = 2
            ctx.shadowColor = obj.glowColor || obj.color
            ctx.shadowBlur = 6
            ctx.stroke()
          }
        } else if (obj.type === 'goal') {
          // Theme-appropriate goal rendering
          if (gameTheme === 'cyberpunk-racing') {
            // Cyberpunk finish gate - energy portal
            const portalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.width/2)
            portalGradient.addColorStop(0, '#ffffff00')
            portalGradient.addColorStop(0.3, (obj.glowColor || '#00ffff') + '80')
            portalGradient.addColorStop(0.7, (obj.glowColor || '#00ffff') + 'FF')
            portalGradient.addColorStop(1, (obj.glowColor || '#00ffff') + '00')
            
            ctx.fillStyle = portalGradient
            ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height)
            
            // Portal ring animations
            for (let i = 0; i < 3; i++) {
              ctx.strokeStyle = (obj.glowColor || '#00ffff') + '66'
              ctx.lineWidth = 3 - i
              ctx.beginPath()
              const ringRadius = (obj.width/3) * (1 + i * 0.3) + Math.sin(gameStateRef.current.time * 0.003 + i) * 5
              ctx.arc(0, 0, ringRadius, 0, Math.PI * 2)
              ctx.stroke()
            }
          } else {
            // Racing checkered flag or traditional goal
            const isRacingGame = gameLogic.title?.toLowerCase().includes('racing') || gameLogic.title?.toLowerCase().includes('car')
            
            if (isRacingGame) {
              // Draw checkered flag pattern
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(-obj.width/2, -obj.height/2, obj.width, obj.height)
              
              // Add checkered pattern
              const squareSize = 8
              for (let x = 0; x < obj.width; x += squareSize) {
                for (let y = 0; y < obj.height; y += squareSize) {
                  if ((Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2 === 1) {
                    ctx.fillStyle = '#000000'
                    ctx.fillRect(-obj.width/2 + x, -obj.height/2 + y, squareSize, squareSize)
                  }
                }
              }
              
              // Add "FINISH" text if goal is large enough
              if (obj.width > 60) {
                ctx.fillStyle = '#FF0000'
                ctx.font = 'bold 12px Arial'
                ctx.textAlign = 'center'
                ctx.fillText('FINISH', 0, 4)
              }
            } else {
              // Standard goal with sparkle effect
              ctx.fillStyle = obj.color
              ctx.beginPath()
              ctx.arc(0, 0, obj.width/2, 0, Math.PI * 2)
              ctx.fill()
              
              // Sparkle rings
              for (let i = 0; i < 2; i++) {
                ctx.strokeStyle = obj.color + '80'
                ctx.lineWidth = 2
                ctx.beginPath()
                const sparkleRadius = obj.width/2 + (i * 6) + Math.sin(gameStateRef.current.time * 0.002 + i) * 3
                ctx.arc(0, 0, sparkleRadius, 0, Math.PI * 2)
                ctx.stroke()
              }
            }
          }
        } else {
          // Generic cyberpunk object with holographic effect
          const holoGradient = ctx.createLinearGradient(-obj.width/2, -obj.height/2, obj.width/2, obj.height/2)
          const hue = (gameStateRef.current.time * 20) % 360
          holoGradient.addColorStop(0, `hsl(${hue}, 80%, 50%)`)
          holoGradient.addColorStop(0.5, obj.color)
          holoGradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 80%, 50%)`)
          ctx.fillStyle = holoGradient
          
          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(-obj.width/2, -obj.height/2, obj.width, obj.height, 4)
          } else {
            ctx.rect(-obj.width/2, -obj.height/2, obj.width, obj.height)
          }
          ctx.fill()
        }
      } else {
        // Default enhanced rendering with theme-appropriate style
        const radius = Math.min(obj.width, obj.height) / 8
        
        // Add subtle theme coloring
        if (gameTheme === 'nature') {
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obj.width/2)
          gradient.addColorStop(0, obj.color)
          gradient.addColorStop(1, obj.color + '80')
          ctx.fillStyle = gradient
        } else if (gameTheme === 'space') {
          const gradient = ctx.createRadialGradient(0, 0, obj.width/4, 0, 0, obj.width/2)
          gradient.addColorStop(0, '#ffffff')
          gradient.addColorStop(0.3, obj.color)
          gradient.addColorStop(1, obj.color + '40')
          ctx.fillStyle = gradient
        } else {
          ctx.fillStyle = obj.color
        }
        
        ctx.beginPath()
        if (ctx.roundRect) {
          ctx.roundRect(-obj.width/2, -obj.height/2, obj.width, obj.height, radius)
        } else {
          ctx.rect(-obj.width/2, -obj.height/2, obj.width, obj.height)
        }
        ctx.fill()
      }
    }

    // Draw sparkle particles
    if (obj.animations.sparkle) {
      ctx.globalCompositeOperation = 'lighter'
      obj.animations.sparkle.particles.forEach(particle => {
        ctx.globalAlpha = particle.life
        ctx.fillStyle = particle.color
        ctx.fillRect(particle.x - obj.x - obj.width/2, particle.y - obj.y - obj.height/2, 2, 2)
      })
      ctx.globalCompositeOperation = 'source-over'
    }
    
    // Enhanced particle trail system for high-end effects
    if (obj.trail?.enabled && obj.animations.trail) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      
      const trailColor = obj.trail.color || obj.glowColor || obj.color
      const particleCount = obj.trail.particleCount || 50
      
      obj.animations.trail.positions.forEach((pos, i) => {
        const alpha = pos.alpha * (1 - i / obj.animations.trail.positions.length)
        ctx.globalAlpha = alpha
        
        // Create gradient for trail particles
        const gradient = ctx.createRadialGradient(
          pos.x - obj.x, pos.y - obj.y, 0,
          pos.x - obj.x, pos.y - obj.y, 8
        )
        gradient.addColorStop(0, trailColor + 'FF')
        gradient.addColorStop(1, trailColor + '00')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(pos.x - obj.x, pos.y - obj.y, 6, 0, Math.PI * 2)
        ctx.fill()
      })
      
      ctx.restore()
    }

    ctx.restore()
  }

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const gameState = gameStateRef.current
    
    // Helper function to safely convert any color to rgba format
    const toRgba = (color: string, alpha: number) => {
      if (color.startsWith('#')) {
        // Hex color
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      } else if (color.startsWith('hsl')) {
        // For HSL, just use rgba with default values and the alpha
        return `rgba(255, 255, 255, ${alpha})`
      } else {
        // Fallback for other formats
        return `rgba(255, 255, 255, ${alpha})`
      }
    }
    
    ctx.globalCompositeOperation = 'lighter'
    gameState.particles.forEach(system => {
      system.particles.forEach(particle => {
        ctx.save()
        ctx.globalAlpha = particle.alpha * 0.8
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        
        // Enhanced particle rendering with multiple effects
        if (particle.size > 3) {
          // Large particles with gradient glow
          const particleGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
          particleGradient.addColorStop(0, toRgba(particle.color, 1))
          particleGradient.addColorStop(0.5, toRgba(particle.color, 0.7))
          particleGradient.addColorStop(1, toRgba(particle.color, 0))
          ctx.fillStyle = particleGradient
          ctx.beginPath()
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Small sparkle particles
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
          ctx.fill()
          
          // Add sparkle cross effect
          ctx.strokeStyle = particle.color
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(-particle.size * 2, 0)
          ctx.lineTo(particle.size * 2, 0)
          ctx.moveTo(0, -particle.size * 2)
          ctx.lineTo(0, particle.size * 2)
          ctx.stroke()
        }
        
        ctx.restore()
      })
    })
    ctx.globalCompositeOperation = 'source-over'
  }

  const drawEffects = (ctx: CanvasRenderingContext2D) => {
    const gameState = gameStateRef.current
    
    gameState.effects = gameState.effects.filter(effect => {
      if (effect.type === 'explosion') {
        const progress = 1 - (effect.life / effect.maxLife)
        const radius = progress * 50
        
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.globalAlpha = effect.life
        
        // Multi-layered explosion effect
        for (let i = 0; i < 3; i++) {
          const layerRadius = radius * (1 - i * 0.3)
          const gradient = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, layerRadius)
          
          if (i === 0) {
            // Core - bright white/yellow
            gradient.addColorStop(0, '#FFFFFF')
            gradient.addColorStop(0.3, '#FFFF00')
            gradient.addColorStop(1, '#FFFF0000')
          } else if (i === 1) {
            // Middle - orange/red
            gradient.addColorStop(0, '#FFAA00')
            gradient.addColorStop(0.5, '#FF6600')
            gradient.addColorStop(1, '#FF660000')
          } else {
            // Outer - red/transparent
            gradient.addColorStop(0, '#FF0000AA')
            gradient.addColorStop(0.7, '#FF000066')
            gradient.addColorStop(1, '#FF000000')
          }
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(effect.x, effect.y, layerRadius, 0, Math.PI * 2)
          ctx.fill()
        }
        
        // Add explosion rays
        ctx.strokeStyle = '#FFFF00AA'
        ctx.lineWidth = 2
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8
          const rayLength = radius * 1.5
          ctx.beginPath()
          ctx.moveTo(effect.x, effect.y)
          ctx.lineTo(
            effect.x + Math.cos(angle) * rayLength,
            effect.y + Math.sin(angle) * rayLength
          )
          ctx.stroke()
        }
        
        ctx.restore()
      }
      
      effect.life -= 0.016 // ~60fps
      return effect.life > 0
    })
  }

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gameState = gameStateRef.current
    const deltaTime = 0.016 // ~60fps

    // Handle input
    if (gameState.player && gameState.keys) {
      const speed = 300 * deltaTime
      if (gameState.keys['ArrowLeft'] || gameState.keys['a']) {
        gameState.player.x -= speed
      }
      if (gameState.keys['ArrowRight'] || gameState.keys['d']) {
        gameState.player.x += speed
      }
      if (gameState.keys['ArrowUp'] || gameState.keys['w']) {
        gameState.player.y -= speed
      }
      if (gameState.keys['ArrowDown'] || gameState.keys['s']) {
        gameState.player.y += speed
      }

      // Keep player in bounds
      gameState.player.x = Math.max(0, Math.min(width - gameState.player.width, gameState.player.x))
      gameState.player.y = Math.max(0, Math.min(height - gameState.player.height, gameState.player.y))
    }

    // Update animations
    gameState.objects.forEach(obj => updateAnimations(obj, deltaTime))
    
    // Update particles
    updateParticles(deltaTime)
    
    // Check collisions
    checkCollisions()

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw everything
    drawBackground(ctx)
    drawParticles(ctx)
    gameState.objects.forEach(obj => drawGameObject(ctx, obj))
    drawEffects(ctx)

    // Draw UI
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Arial'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.strokeText(`Score: ${gameState.score}`, 20, 40)
    ctx.fillText(`Score: ${gameState.score}`, 20, 40)

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [width, height, onScoreChange, onGameComplete])

  // Keyboard event handlers
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

  // Initialize game and start loop
  useEffect(() => {
    initializeGame()
    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLogic, initializeGame, gameLoop])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`border-2 border-gray-300 rounded-lg ${className}`}
      style={{ 
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}
    />
  )
}