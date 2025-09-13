'use client'

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as Phaser from 'phaser'
import type { GameLogic, GameEngineRef, GameEngineConfig } from '@/types'

interface GameEngineProps {
  gameLogic: GameLogic
  width?: number
  height?: number
  onScoreChange?: (score: number) => void
  onGameComplete?: (won: boolean, finalScore: number) => void
  onGameEvent?: (event: any) => void
  className?: string
}

const GameEngine = forwardRef<GameEngineRef, GameEngineProps>(({
  gameLogic,
  width = 800,
  height = 600,
  onScoreChange,
  onGameComplete,
  onGameEvent,
  className = ''
}, ref) => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<Phaser.Game | null>(null)
  const gameStateRef = useRef({
    score: 0,
    isRunning: false,
    isPaused: false
  })

  // Expose game control methods
  useImperativeHandle(ref, () => ({
    start: () => {
      if (phaserGameRef.current) {
        gameStateRef.current.isRunning = true
        gameStateRef.current.isPaused = false
        phaserGameRef.current.scene.resume('GameScene')
      }
    },
    pause: () => {
      if (phaserGameRef.current) {
        gameStateRef.current.isPaused = true
        phaserGameRef.current.scene.pause('GameScene')
      }
    },
    resume: () => {
      if (phaserGameRef.current) {
        gameStateRef.current.isPaused = false
        phaserGameRef.current.scene.resume('GameScene')
      }
    },
    restart: () => {
      if (phaserGameRef.current) {
        gameStateRef.current.score = 0
        gameStateRef.current.isRunning = true
        gameStateRef.current.isPaused = false
        phaserGameRef.current.scene.start('GameScene')
        onScoreChange?.(0)
      }
    },
    destroy: () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
        gameStateRef.current.isRunning = false
      }
    },
    getScore: () => gameStateRef.current.score,
    updateGameLogic: (newLogic: GameLogic) => {
      // For now, restart with new logic - in production this could be more sophisticated
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
      }
      initializeGame(newLogic)
    }
  }))

  const initializeGame = (logic: GameLogic) => {
    if (!gameRef.current) return

    // Create the main game scene
    class GameScene extends Phaser.Scene {
      private gameObjects: Map<string, Phaser.GameObjects.GameObject> = new Map()
      private player?: Phaser.GameObjects.GameObject
      private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
      private score = 0
      private scoreText?: Phaser.GameObjects.Text
      private particles?: Phaser.GameObjects.Particles.ParticleEmitter
      private background?: Phaser.GameObjects.Graphics | Phaser.GameObjects.TileSprite

      constructor() {
        super({ key: 'GameScene' })
      }

      preload() {
        // Create simple colored rectangles as placeholders for sprites
        this.load.image('placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')
      }

      create() {
        // Set up world bounds
        this.physics.world.setBounds(0, 0, logic.worldSize.width, logic.worldSize.height)

        // Create background
        this.createBackground()

        // Create game objects
        logic.objects.forEach(obj => this.createGameObject(obj))

        // Set up controls
        if (logic.controls.type === 'arrows' || logic.controls.type === 'wasd') {
          this.cursors = this.input.keyboard?.createCursorKeys()
        }

        // Set up camera
        if (logic.camera?.followPlayer && this.player) {
          this.cameras.main.startFollow(this.player)
        }

        // Create UI with responsive font size
        const responsiveFontSize = Math.max(16, Math.min(32, width * 0.03))
        this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
          fontSize: `${responsiveFontSize}px`,
          color: '#000'
        })
        this.scoreText.setScrollFactor(0) // Keep UI fixed to camera

        // Set up events
        logic.events.forEach(event => this.setupGameEvent(event))

        // Initialize particles for effects
        this.setupParticleEffects()

        gameStateRef.current.isRunning = true
      }

      update() {
        if (!gameStateRef.current.isRunning || gameStateRef.current.isPaused) return

        // Handle player movement
        if (this.player && this.cursors) {
          const playerBody = this.player.body as Phaser.Physics.Arcade.Body

          // Kid-friendly movement speeds
          const PLAYER_SPEED = 150  // Reduced from 200
          const JUMP_SPEED = 300    // Reduced from 400

          if (this.cursors.left.isDown) {
            playerBody.setVelocityX(-PLAYER_SPEED)
          } else if (this.cursors.right.isDown) {
            playerBody.setVelocityX(PLAYER_SPEED)
          } else {
            playerBody.setVelocityX(0)
          }

          if (this.cursors.up.isDown && playerBody.touching.down) {
            playerBody.setVelocityY(-JUMP_SPEED)
          }
        }

        // Update score display
        if (this.scoreText) {
          this.scoreText.setText(`Score: ${this.score}`)
        }

        // Check win conditions
        this.checkWinConditions()
      }

      private createBackground() {
        const bg = logic.background
        const graphics = this.add.graphics()

        switch (bg.type) {
          case 'solid':
            graphics.fillStyle(this.hexToNumber(bg.colors[0]))
            graphics.fillRect(0, 0, logic.worldSize.width, logic.worldSize.height)
            break
          
          case 'gradient':
            // Simple gradient effect using multiple rectangles
            const steps = 20
            for (let i = 0; i < steps; i++) {
              const alpha = i / steps
              const color = this.interpolateColor(bg.colors[0], bg.colors[1] || bg.colors[0], alpha)
              graphics.fillStyle(this.hexToNumber(color), 1)
              graphics.fillRect(0, (logic.worldSize.height / steps) * i, logic.worldSize.width, logic.worldSize.height / steps)
            }
            break

          case 'starfield':
            graphics.fillStyle(0x000033)
            graphics.fillRect(0, 0, logic.worldSize.width, logic.worldSize.height)
            // Add stars
            for (let i = 0; i < 100; i++) {
              const x = Math.random() * logic.worldSize.width
              const y = Math.random() * logic.worldSize.height
              graphics.fillStyle(0xffffff)
              graphics.fillCircle(x, y, Math.random() * 2)
            }
            break

          default:
            graphics.fillStyle(0x87CEEB) // Sky blue
            graphics.fillRect(0, 0, logic.worldSize.width, logic.worldSize.height)
        }

        this.background = graphics
      }

      private createGameObject(obj: any) {
        let gameObject: Phaser.GameObjects.GameObject

        // Create visual representation based on sprite type
        const color = this.hexToNumber(obj.sprite.color)
        
        switch (obj.sprite.type) {
          case 'circle':
            gameObject = this.add.circle(obj.position.x, obj.position.y, obj.size.width / 2, color)
            break
          case 'square':
            gameObject = this.add.rectangle(obj.position.x, obj.position.y, obj.size.width, obj.size.height, color)
            break
          case 'star':
            gameObject = this.add.star(obj.position.x, obj.position.y, 5, obj.size.width / 4, obj.size.width / 2, color)
            break
          default:
            gameObject = this.add.rectangle(obj.position.x, obj.position.y, obj.size.width, obj.size.height, color)
        }

        // Add physics if needed
        if (obj.physics || obj.type === 'player') {
          this.physics.add.existing(gameObject)
          const body = (gameObject as any).body as Phaser.Physics.Arcade.Body
          
          if (obj.physics?.gravity) {
            body.setGravityY(obj.physics.gravity)
          }
          
          if (obj.type === 'player') {
            body.setCollideWorldBounds(true)
            this.player = gameObject
          }
        }

        // Store reference
        this.gameObjects.set(obj.id, gameObject)

        // Set up animations
        if (obj.animation) {
          this.setupAnimation(gameObject, obj.animation)
        }

        return gameObject
      }

      private setupAnimation(gameObject: Phaser.GameObjects.GameObject, animation: any) {
        switch (animation.type) {
          case 'bounce':
            this.tweens.add({
              targets: gameObject,
              y: (gameObject as any).y - 20,
              duration: animation.duration / 2,
              ease: 'Power2',
              yoyo: true,
              repeat: animation.repeat ? -1 : 0
            })
            break
          
          case 'spin':
            this.tweens.add({
              targets: gameObject,
              rotation: Math.PI * 2,
              duration: animation.duration,
              repeat: animation.repeat ? -1 : 0,
              ease: 'Linear'
            })
            break
          
          case 'pulse':
            this.tweens.add({
              targets: gameObject,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: animation.duration / 2,
              ease: 'Power2',
              yoyo: true,
              repeat: animation.repeat ? -1 : 0
            })
            break
        }
      }

      private setupGameEvent(event: any) {
        switch (event.trigger) {
          case 'collision':
            if (event.condition?.objectId) {
              const obj1 = this.gameObjects.get(event.condition.objectId)
              if (obj1 && this.player) {
                this.physics.add.overlap(this.player, obj1, () => {
                  this.executeEventActions(event.actions)
                })
              }
            }
            break
          
          case 'keypress':
            if (event.condition?.key) {
              this.input.keyboard?.on(`keydown-${event.condition.key.toUpperCase()}`, () => {
                this.executeEventActions(event.actions)
              })
            }
            break
        }
      }

      private executeEventActions(actions: any[]) {
        actions.forEach(action => {
          switch (action.type) {
            case 'score':
              this.score += action.value || 10
              onScoreChange?.(this.score)
              gameStateRef.current.score = this.score
              this.showScoreEffect(action.value || 10)
              break
            
            case 'destroy':
              if (action.targetId) {
                const target = this.gameObjects.get(action.targetId)
                if (target) {
                  this.createDestroyEffect(target)
                  target.destroy()
                  this.gameObjects.delete(action.targetId)
                }
              }
              break
            
            case 'win':
              this.handleGameComplete(true)
              break
            
            case 'lose':
              this.handleGameComplete(false)
              break
            
            case 'effect':
              this.createParticleEffect(action.value)
              break
          }
        })
      }

      private setupParticleEffects() {
        // Create particle emitter for various effects
        const particles = this.add.particles(0, 0, 'placeholder', {
          scale: { start: 0.5, end: 0 },
          speed: { min: 50, max: 100 },
          quantity: 5,
          lifespan: 600,
          emitting: false
        })
        
        this.particles = particles
      }

      private showScoreEffect(points: number) {
        if (this.player) {
          const responsiveFontSize = Math.max(14, Math.min(24, width * 0.025))
          const text = this.add.text((this.player as any).x, (this.player as any).y - 30, `+${points}`, {
            fontSize: `${responsiveFontSize}px`,
            color: '#ffff00'
          })
          
          this.tweens.add({
            targets: text,
            y: text.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
          })
        }
      }

      private createDestroyEffect(gameObject: Phaser.GameObjects.GameObject) {
        if (this.particles) {
          this.particles.setPosition((gameObject as any).x, (gameObject as any).y)
          this.particles.explode(10)
        }
      }

      private createParticleEffect(type: string) {
        if (this.particles && this.player) {
          this.particles.setPosition((this.player as any).x, (this.player as any).y)
          this.particles.explode(20)
        }
      }

      private checkWinConditions() {
        logic.rules.winConditions.forEach((condition: any) => {
          switch (condition.type) {
            case 'score_target':
              if (condition.target && this.score >= condition.target) {
                this.handleGameComplete(true)
              }
              break
            
            case 'collect_all':
              const collectibles = Array.from(this.gameObjects.values()).filter(obj => 
                logic.objects.find(o => this.gameObjects.get(o.id) === obj)?.type === 'collectible'
              )
              if (collectibles.length === 0) {
                this.handleGameComplete(true)
              }
              break
          }
        })
      }

      private handleGameComplete(won: boolean) {
        gameStateRef.current.isRunning = false
        onGameComplete?.(won, this.score)
        
        // Show completion effect
        if (won && this.particles) {
          this.particles.setPosition(width / 2, height / 2)
          this.particles.explode(50)
        }
      }

      private hexToNumber(hex: string): number {
        if (hex.startsWith('#')) {
          return parseInt(hex.substring(1), 16)
        }
        
        const colorMap: Record<string, number> = {
          red: 0xff0000,
          blue: 0x0000ff,
          green: 0x00ff00,
          yellow: 0xffff00,
          purple: 0xff00ff,
          pink: 0xffc0cb,
          orange: 0xffa500,
          white: 0xffffff,
          black: 0x000000
        }
        
        return colorMap[hex] || 0x888888
      }

      private interpolateColor(color1: string, color2: string, t: number): string {
        const c1 = this.hexToNumber(color1)
        const c2 = this.hexToNumber(color2)
        
        const r1 = (c1 >> 16) & 255
        const g1 = (c1 >> 8) & 255
        const b1 = c1 & 255
        
        const r2 = (c2 >> 16) & 255
        const g2 = (c2 >> 8) & 255
        const b2 = c2 & 255
        
        const r = Math.round(r1 + (r2 - r1) * t)
        const g = Math.round(g1 + (g2 - g1) * t)
        const b = Math.round(b1 + (b2 - b1) * t)
        
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
      }
    }

    // Phaser game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: gameRef.current,
      fps: {
        target: 60,
        forceSetTimeOut: true
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: logic.physics?.gravity || 300, x: 0 },
          debug: false
        }
      },
      scene: [GameScene],
      backgroundColor: '#87CEEB'
    }

    // Create the game
    phaserGameRef.current = new Phaser.Game(config)
  }

  useEffect(() => {
    initializeGame(gameLogic)

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [gameLogic])

  return (
    <div 
      ref={gameRef} 
      className={`game-canvas ${className}`}
      style={{ width, height }}
    />
  )
})

GameEngine.displayName = 'GameEngine'

export default GameEngine