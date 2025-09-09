'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'

// 🚀 EMERGENT GAME ENGINE - NO SCHEMA CONSTRAINTS!
// This engine adapts to ANY game concept the AI generates

interface EmergentGameProps {
  conceptAnalysis: string
  gameImplementation: string
  userVision: string
  onExperienceComplete?: (experience: any) => void
  className?: string
}

interface EmergentEntity {
  id: string
  concept: string // What this entity represents conceptually
  properties: { [key: string]: any } // Dynamic properties
  position: { x: number; y: number }
  visualState: { [key: string]: any }
  behaviorState: { [key: string]: any }
  interactions: string[] // What this can interact with
}

interface EmergentSystem {
  name: string
  type: 'physics' | 'visual' | 'interaction' | 'progression' | 'emergent'
  properties: { [key: string]: any }
  active: boolean
}

export default function EmergentGameEngine({
  conceptAnalysis,
  gameImplementation,
  userVision,
  onExperienceComplete,
  className = ''
}: EmergentGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [gameState, setGameState] = useState<{
    entities: Map<string, EmergentEntity>
    systems: Map<string, EmergentSystem>
    experienceState: { [key: string]: any }
    playerState: { [key: string]: any }
    time: number
  }>({
    entities: new Map(),
    systems: new Map(),
    experienceState: {},
    playerState: {},
    time: 0
  })

  // 🧠 PARSE CONCEPT AND GENERATE EMERGENT SYSTEMS
  const initializeEmergentGame = useCallback(() => {
    console.log('🌟 Initializing Emergent Game Engine...')
    console.log('User Vision:', userVision)
    
    try {
      // Parse the AI's concept analysis and implementation
      const entities = new Map<string, EmergentEntity>()
      const systems = new Map<string, EmergentSystem>()
      
      // 🎨 DYNAMIC CONCEPT PARSING
      // Extract key concepts from the AI's analysis
      const concepts = extractConcepts(conceptAnalysis, gameImplementation)
      console.log('🔍 Extracted concepts:', concepts)

      // 🎯 GENERATE PLAYER ENTITY
      const playerConcept = concepts.find(c => 
        c.includes('player') || c.includes('character') || 
        c.includes('you') || c.includes('control')
      ) || 'dynamic-being'

      entities.set('player', {
        id: 'player',
        concept: playerConcept,
        properties: {
          controllable: true,
          responsive: true,
          adaptive: true
        },
        position: { x: 100, y: 300 },
        visualState: {
          form: determineVisualForm(playerConcept),
          energy: 1.0,
          resonance: 'neutral'
        },
        behaviorState: {
          momentum: { x: 0, y: 0 },
          intention: 'exploring',
          connection: 0
        },
        interactions: ['environment', 'objectives', 'systems']
      })

      // 🌟 GENERATE EXPERIENCE OBJECTIVES
      const objectiveConcepts = extractObjectives(conceptAnalysis)
      objectiveConcepts.forEach((concept, i) => {
        entities.set(`objective_${i}`, {
          id: `objective_${i}`,
          concept: concept,
          properties: {
            discoverable: true,
            meaningful: true,
            evolving: true
          },
          position: { 
            x: 200 + (i * 150) + Math.sin(i * 2) * 100, 
            y: 200 + Math.cos(i * 1.5) * 100 
          },
          visualState: {
            form: determineVisualForm(concept),
            intensity: 0.8 + Math.sin(i) * 0.2,
            evolution: 0
          },
          behaviorState: {
            attraction: 'subtle',
            response: 'anticipatory'
          },
          interactions: ['player', 'environment']
        })
      })

      // ⚡ GENERATE EMERGENT SYSTEMS
      const systemConcepts = extractSystems(gameImplementation)
      systemConcepts.forEach(systemConcept => {
        systems.set(systemConcept.name, {
          name: systemConcept.name,
          type: systemConcept.type,
          properties: systemConcept.properties,
          active: true
        })
      })

      setGameState(prev => ({
        ...prev,
        entities,
        systems,
        experienceState: {
          initialized: true,
          userVision: userVision,
          phase: 'discovery',
          emergence: 0
        },
        playerState: {
          understanding: 0,
          engagement: 0,
          mastery: 0
        }
      }))

      console.log('✨ Emergent game initialized!')
      console.log('Entities:', entities.size)
      console.log('Systems:', systems.size)

    } catch (error) {
      console.error('❌ Error initializing emergent game:', error)
    }
  }, [conceptAnalysis, gameImplementation, userVision])

  // 🎮 EMERGENT GAME LOOP
  const emergentGameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const deltaTime = 0.016 // ~60fps

    setGameState(prev => {
      const newTime = prev.time + deltaTime
      const newGameState = { ...prev, time: newTime }

      // 🌟 UPDATE EMERGENT SYSTEMS
      newGameState.systems.forEach((system, key) => {
        if (system.active) {
          updateEmergentSystem(system, newGameState, deltaTime)
        }
      })

      // 🎯 UPDATE ENTITIES
      newGameState.entities.forEach((entity, key) => {
        updateEmergentEntity(entity, newGameState, deltaTime)
      })

      // 🧠 PROCESS EMERGENT INTERACTIONS
      processEmergentInteractions(newGameState)

      return newGameState
    })

    // 🎨 RENDER EMERGENT EXPERIENCE
    renderEmergentExperience(ctx, gameState, canvas.width, canvas.height)

    animationRef.current = requestAnimationFrame(emergentGameLoop)
  }, [gameState])

  // 🔍 CONCEPT EXTRACTION FUNCTIONS
  const extractConcepts = (analysis: string, implementation: string): string[] => {
    const text = analysis + ' ' + implementation
    const concepts: string[] = []
    
    // Extract key conceptual terms
    const patterns = [
      /(?:player|character|user|you)\s+(?:control|guide|become|are|embody)\s+([^.!?]+)/gi,
      /(?:collect|gather|find|discover|obtain)\s+([^.!?]+)/gi,
      /(?:experience|feel|sense)\s+([^.!?]+)/gi,
      /(?:interact with|manipulate|influence)\s+([^.!?]+)/gi
    ]

    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern)
      for (const match of Array.from(matches)) {
        if (match[1] && match[1].length > 3) {
          concepts.push(match[1].trim().toLowerCase())
        }
      }
    })

    return Array.from(new Set(concepts)).slice(0, 10) // Unique concepts, max 10
  }

  const extractObjectives = (analysis: string): string[] => {
    const objectives: string[] = []
    
    // Look for objective-related language
    const objectivePatterns = [
      /(?:goal|objective|aim|purpose).*?(?:is to|involves)\s+([^.!?]+)/gi,
      /(?:collect|gather|find|discover|achieve)\s+([^.!?]+)/gi,
      /(?:player must|player should|player can)\s+([^.!?]+)/gi
    ]

    objectivePatterns.forEach(pattern => {
      const matches = analysis.matchAll(pattern)
      for (const match of Array.from(matches)) {
        if (match[1] && match[1].length > 5) {
          objectives.push(match[1].trim())
        }
      }
    })

    return objectives.slice(0, 6) // Max 6 objectives
  }

  const extractSystems = (implementation: string): Array<{name: string, type: any, properties: any}> => {
    const systems: Array<{name: string, type: any, properties: any}> = []
    
    // Default emergent systems based on common patterns
    systems.push(
      {
        name: 'resonance',
        type: 'interaction',
        properties: { sensitivity: 0.8, feedback: 'visual-audio' }
      },
      {
        name: 'emergence',
        type: 'progression', 
        properties: { complexity: 'adaptive', discovery: 'organic' }
      },
      {
        name: 'flow',
        type: 'experience',
        properties: { pacing: 'dynamic', challenge: 'balanced' }
      }
    )

    return systems
  }

  const determineVisualForm = (concept: string): string => {
    if (concept.includes('energy') || concept.includes('spirit')) return 'energy-form'
    if (concept.includes('nature') || concept.includes('organic')) return 'organic-form'  
    if (concept.includes('geometric') || concept.includes('crystal')) return 'geometric-form'
    if (concept.includes('flow') || concept.includes('liquid')) return 'fluid-form'
    return 'adaptive-form'
  }

  // 🔄 UPDATE FUNCTIONS
  const updateEmergentSystem = (system: EmergentSystem, gameState: any, deltaTime: number) => {
    // Systems evolve and adapt based on player interaction
    switch (system.type) {
      case 'interaction':
        system.properties.resonance = Math.sin(gameState.time * 2) * 0.5 + 0.5
        break
      case 'progression':
        system.properties.complexity += gameState.playerState.engagement * deltaTime * 0.1
        break
      case 'emergent':
        system.properties.intensity = gameState.playerState.understanding * 0.8 + 0.2
        break
    }
  }

  const updateEmergentEntity = (entity: EmergentEntity, gameState: any, deltaTime: number) => {
    // Entities respond to systems and player state
    if (entity.id === 'player') {
      // Player adapts to experience
      entity.visualState.energy = 0.7 + Math.sin(gameState.time) * 0.3
      entity.behaviorState.connection += deltaTime * 0.1
    } else {
      // Objectives evolve based on player proximity and understanding  
      const player = gameState.entities.get('player')
      if (player) {
        const distance = Math.sqrt(
          Math.pow(entity.position.x - player.position.x, 2) +
          Math.pow(entity.position.y - player.position.y, 2)
        )
        entity.visualState.intensity = Math.max(0.3, 1 - (distance / 200))
        entity.visualState.evolution += deltaTime * (distance < 100 ? 0.5 : 0.1)
      }
    }
  }

  const processEmergentInteractions = (gameState: any) => {
    const player = gameState.entities.get('player')
    if (!player) return

    // Process interactions between entities
    gameState.entities.forEach((entity: EmergentEntity) => {
      if (entity.id === 'player') return

      const distance = Math.sqrt(
        Math.pow(entity.position.x - player.position.x, 2) +
        Math.pow(entity.position.y - player.position.y, 2)
      )

      if (distance < 60) {
        // Interaction occurs
        gameState.playerState.understanding += 0.02
        gameState.playerState.engagement += 0.01
        entity.behaviorState.response = 'resonating'
        
        // Trigger experience evolution
        if (gameState.playerState.understanding > 0.8) {
          gameState.experienceState.phase = 'mastery'
        } else if (gameState.playerState.understanding > 0.4) {
          gameState.experienceState.phase = 'understanding'
        }
      }
    })
  }

  // 🎨 EMERGENT RENDERING
  const renderEmergentExperience = (ctx: CanvasRenderingContext2D, gameState: any, width: number, height: number) => {
    // Clear with dynamic background
    const bgIntensity = gameState.playerState.understanding * 0.3 + 0.1
    ctx.fillStyle = `rgba(${Math.floor(bgIntensity * 50)}, ${Math.floor(bgIntensity * 30)}, ${Math.floor(bgIntensity * 80)}, 1)`
    ctx.fillRect(0, 0, width, height)

    // Render emergent field effects
    renderEmergentField(ctx, gameState, width, height)

    // Render all entities
    gameState.entities.forEach((entity: EmergentEntity) => {
      renderEmergentEntity(ctx, entity, gameState)
    })

    // Render experience indicators
    renderExperienceState(ctx, gameState, width, height)
  }

  const renderEmergentField = (ctx: CanvasRenderingContext2D, gameState: any, width: number, height: number) => {
    // Dynamic field visualization based on player state
    const resonance = gameState.systems.get('resonance')?.properties.resonance || 0
    
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = 0.3

    for (let i = 0; i < 20; i++) {
      const x = (i * width / 20) + Math.sin(gameState.time + i) * 30
      const y = height / 2 + Math.cos(gameState.time * 0.5 + i) * 100
      const radius = 5 + resonance * 15
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(100, 200, 255, ${resonance})`)
      gradient.addColorStop(1, 'rgba(100, 200, 255, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  const renderEmergentEntity = (ctx: CanvasRenderingContext2D, entity: EmergentEntity, gameState: any) => {
    ctx.save()
    
    const { x, y } = entity.position
    const { form, intensity, evolution } = entity.visualState
    
    ctx.translate(x, y)
    ctx.globalAlpha = intensity

    // Render based on visual form
    switch (form) {
      case 'energy-form':
        renderEnergyForm(ctx, entity, gameState)
        break
      case 'organic-form':
        renderOrganicForm(ctx, entity, gameState)
        break
      case 'geometric-form':
        renderGeometricForm(ctx, entity, gameState)
        break
      case 'fluid-form':
        renderFluidForm(ctx, entity, gameState)
        break
      default:
        renderAdaptiveForm(ctx, entity, gameState)
    }

    ctx.restore()
  }

  // Specialized rendering functions
  const renderEnergyForm = (ctx: CanvasRenderingContext2D, entity: EmergentEntity, gameState: any) => {
    const pulsePhase = gameState.time * 3 + entity.position.x * 0.01
    const radius = 20 + Math.sin(pulsePhase) * 8
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)')
    gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.6)')
    gradient.addColorStop(1, 'rgba(100, 200, 255, 0)')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const renderOrganicForm = (ctx: CanvasRenderingContext2D, entity: EmergentEntity, gameState: any) => {
    const evolution = entity.visualState.evolution || 0
    const branches = 6 + Math.floor(evolution * 4)
    
    ctx.strokeStyle = `rgba(50, 200, 50, ${entity.visualState.intensity})`
    ctx.lineWidth = 3
    
    for (let i = 0; i < branches; i++) {
      const angle = (i / branches) * Math.PI * 2 + gameState.time * 0.5
      const length = 15 + evolution * 10
      
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length)
      ctx.stroke()
    }
  }

  const renderGeometricForm = (ctx: CanvasRenderingContext2D, entity: EmergentEntity, gameState: any) => {
    const sides = 6
    const radius = 18 + entity.visualState.evolution * 5
    const rotation = gameState.time + entity.position.x * 0.01
    
    ctx.fillStyle = `rgba(200, 100, 255, ${entity.visualState.intensity})`
    ctx.beginPath()
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + rotation
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    
    ctx.closePath()
    ctx.fill()
  }

  const renderFluidForm = (ctx: CanvasRenderingContext2D, entity: EmergentEntity, gameState: any) => {
    const waves = 8
    const baseRadius = 16
    
    ctx.fillStyle = `rgba(100, 255, 200, ${entity.visualState.intensity})`
    ctx.beginPath()
    
    for (let i = 0; i <= waves * 2; i++) {
      const angle = (i / waves) * Math.PI
      const waveOffset = Math.sin(gameState.time * 2 + i) * 4
      const radius = baseRadius + waveOffset
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    
    ctx.closePath()
    ctx.fill()
  }

  const renderAdaptiveForm = (ctx: CanvasRenderingContext2D, entity: EmergentEntity, gameState: any) => {
    // Adapts based on game state and entity properties
    const adaptiveness = gameState.playerState.understanding
    const size = 15 + adaptiveness * 10
    
    if (entity.id === 'player') {
      // Player visualization adapts to connection level
      const connection = entity.behaviorState.connection || 0
      ctx.fillStyle = `rgba(${Math.floor(255 - connection * 100)}, ${Math.floor(200 + connection * 50)}, 255, 0.8)`
      ctx.beginPath()
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.fill()
      
      // Connection aura
      if (connection > 0.3) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${connection * 0.5})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2)
        ctx.stroke()
      }
    } else {
      // Objective visualization
      ctx.fillStyle = `rgba(255, 200, 100, ${entity.visualState.intensity})`
      ctx.beginPath()
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const renderExperienceState = (ctx: CanvasRenderingContext2D, gameState: any, width: number, height: number) => {
    // Display experience progression
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '16px Arial'
    ctx.fillText(`Phase: ${gameState.experienceState.phase || 'discovery'}`, 20, 30)
    ctx.fillText(`Understanding: ${Math.floor((gameState.playerState.understanding || 0) * 100)}%`, 20, 55)
    ctx.fillText(`Engagement: ${Math.floor((gameState.playerState.engagement || 0) * 100)}%`, 20, 80)
    
    // Experience vision reminder
    ctx.fillStyle = 'rgba(200, 200, 255, 0.6)'
    ctx.font = '14px Arial'
    const visionText = `Vision: ${userVision.substring(0, 50)}${userVision.length > 50 ? '...' : ''}`
    ctx.fillText(visionText, 20, height - 20)
  }

  // 🎮 INPUT HANDLING
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setGameState(prev => {
        const player = prev.entities.get('player')
        if (!player) return prev

        const speed = 4
        const newPlayer = { ...player }

        switch (e.key) {
          case 'ArrowLeft':
          case 'a':
            newPlayer.position.x = Math.max(0, player.position.x - speed)
            break
          case 'ArrowRight':
          case 'd':
            newPlayer.position.x = Math.min(800, player.position.x + speed)
            break
          case 'ArrowUp':
          case 'w':
            newPlayer.position.y = Math.max(0, player.position.y - speed)
            break
          case 'ArrowDown':
          case 's':
            newPlayer.position.y = Math.min(600, player.position.y + speed)
            break
        }

        const newEntities = new Map(prev.entities)
        newEntities.set('player', newPlayer)
        
        return { ...prev, entities: newEntities }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Initialize and start the emergent experience
  useEffect(() => {
    initializeEmergentGame()
    animationRef.current = requestAnimationFrame(emergentGameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initializeEmergentGame, emergentGameLoop])

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="border-2 border-gray-300 rounded-lg w-full h-full"
        style={{ 
          background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}
      />
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-2 rounded">
        🌟 Emergent Game Engine - No Schema Constraints!<br/>
        Use WASD or Arrow Keys to explore
      </div>
    </div>
  )
}