import * as PIXI from 'pixi.js'
import { Palette } from '../types/gamespec'

export class ParticleSystem {
  private container: PIXI.Container | null = null
  private systems: ParticleEmitter[] = []

  init(parentContainer: PIXI.Container): void {
    this.container = new PIXI.Container()
    parentContainer.addChild(this.container)
  }

  createWeatherSystem(weatherType: string, backgroundContainer: PIXI.Container): void {
    switch (weatherType) {
      case 'snow':
        this.createSnowSystem(backgroundContainer)
        break
      case 'floating-leaves':
        this.createLeavesSystem(backgroundContainer)
        break
      case 'bubbles':
        this.createBubblesSystem(backgroundContainer)
        break
    }
  }

  private createSnowSystem(container: PIXI.Container): void {
    const emitter = new ParticleEmitter(container, 'snow')
    emitter.spawn(50, () => ({
      x: Math.random() * container.width,
      y: -10,
      vx: -0.5 + Math.random(),
      vy: 1 + Math.random() * 2,
      size: 2 + Math.random() * 3,
      alpha: 0.6 + Math.random() * 0.4,
      color: 0xFFFFFF
    }))
    
    this.systems.push(emitter)
  }

  private createLeavesSystem(container: PIXI.Container): void {
    const emitter = new ParticleEmitter(container, 'leaves')
    emitter.spawn(30, () => ({
      x: Math.random() * container.width,
      y: -10,
      vx: -1 + Math.random() * 2,
      vy: 0.5 + Math.random(),
      size: 8 + Math.random() * 8,
      alpha: 0.7 + Math.random() * 0.3,
      color: 0x228B22,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: -0.02 + Math.random() * 0.04
    }))
    
    this.systems.push(emitter)
  }

  private createBubblesSystem(container: PIXI.Container): void {
    const emitter = new ParticleEmitter(container, 'bubbles')
    emitter.spawn(40, () => ({
      x: Math.random() * container.width,
      y: container.height + 10,
      vx: -0.5 + Math.random(),
      vy: -1 - Math.random() * 2,
      size: 3 + Math.random() * 8,
      alpha: 0.3 + Math.random() * 0.4,
      color: 0x87CEEB
    }))
    
    this.systems.push(emitter)
  }

  createAmbientSystem(particleType: string, palette: Palette): void {
    if (!this.container) return

    const emitter = new ParticleEmitter(this.container, particleType)
    
    switch (particleType) {
      case 'sparkle':
        emitter.spawn(20, () => ({
          x: Math.random() * this.container!.width,
          y: Math.random() * this.container!.height,
          vx: -0.5 + Math.random(),
          vy: -0.5 + Math.random(),
          size: 2 + Math.random() * 4,
          alpha: 0.8 + Math.random() * 0.2,
          color: parseInt(palette.accent.slice(1), 16),
          life: 120 + Math.random() * 120
        }))
        break
        
      case 'dustMotes':
        emitter.spawn(15, () => ({
          x: Math.random() * this.container!.width,
          y: Math.random() * this.container!.height,
          vx: -0.2 + Math.random() * 0.4,
          vy: -0.2 + Math.random() * 0.4,
          size: 1 + Math.random() * 2,
          alpha: 0.3 + Math.random() * 0.3,
          color: parseInt(palette.secondary.slice(1), 16),
          life: 180 + Math.random() * 180
        }))
        break
    }
    
    this.systems.push(emitter)
  }

  createBurst(x: number, y: number, color: string): void {
    if (!this.container) return

    const emitter = new ParticleEmitter(this.container, 'burst', true) // one-shot
    const colorInt = parseInt(color.slice(1), 16)
    
    emitter.spawn(15, () => ({
      x: x,
      y: y,
      vx: -3 + Math.random() * 6,
      vy: -3 + Math.random() * 6,
      size: 3 + Math.random() * 5,
      alpha: 1,
      color: colorInt,
      life: 60 + Math.random() * 60
    }))
    
    this.systems.push(emitter)
  }

  createVictoryEffect(x: number, y: number): void {
    if (!this.container) return

    // Create multiple burst effects
    const colors = [0xFFD700, 0xFF69B4, 0x00FF7F, 0xFF6347, 0x1E90FF]
    
    colors.forEach((color, i) => {
      setTimeout(() => {
        const emitter = new ParticleEmitter(this.container!, 'victory', true)
        emitter.spawn(20, () => ({
          x: x + (-50 + Math.random() * 100),
          y: y + (-50 + Math.random() * 100),
          vx: -4 + Math.random() * 8,
          vy: -4 + Math.random() * 8,
          size: 4 + Math.random() * 6,
          alpha: 1,
          color: color,
          life: 90 + Math.random() * 90
        }))
        
        this.systems.push(emitter)
      }, i * 200)
    })
  }

  update(delta: number): void {
    // Update all particle systems
    this.systems = this.systems.filter(system => {
      system.update(delta)
      return !system.isDead()
    })
  }

  destroy(): void {
    this.systems.forEach(system => system.destroy())
    this.systems = []
    
    if (this.container && this.container.parent) {
      this.container.parent.removeChild(this.container)
    }
  }
}

class ParticleEmitter {
  private particles: Particle[] = []
  private container: PIXI.Container
  private type: string
  private isOneShot: boolean

  constructor(container: PIXI.Container, type: string, isOneShot = false) {
    this.container = container
    this.type = type
    this.isOneShot = isOneShot
  }

  spawn(count: number, particleFactory: () => ParticleData): void {
    for (let i = 0; i < count; i++) {
      const data = particleFactory()
      const particle = new Particle(data)
      this.particles.push(particle)
      this.container.addChild(particle.sprite)
    }
  }

  update(delta: number): void {
    this.particles = this.particles.filter(particle => {
      particle.update(delta)
      
      if (particle.isDead()) {
        this.container.removeChild(particle.sprite)
        return false
      }
      
      return true
    })
    
    // Respawn particles for continuous systems
    if (!this.isOneShot && this.particles.length < this.getTargetCount()) {
      // Respawn logic would go here
    }
  }

  private getTargetCount(): number {
    // Return target particle count based on type
    switch (this.type) {
      case 'snow': return 50
      case 'leaves': return 30
      case 'bubbles': return 40
      case 'sparkle': return 20
      case 'dustMotes': return 15
      default: return 10
    }
  }

  isDead(): boolean {
    return this.isOneShot && this.particles.length === 0
  }

  destroy(): void {
    this.particles.forEach(particle => {
      if (particle.sprite.parent) {
        particle.sprite.parent.removeChild(particle.sprite)
      }
    })
    this.particles = []
  }
}

interface ParticleData {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  color: number
  life?: number
  rotation?: number
  rotationSpeed?: number
}

class Particle {
  public sprite: PIXI.Graphics
  private vx: number
  private vy: number
  private life: number
  private maxLife: number
  private rotationSpeed: number

  constructor(data: ParticleData) {
    this.sprite = new PIXI.Graphics()
    this.sprite.circle(0, 0, data.size)
    this.sprite.fill(data.color)
    this.sprite.x = data.x
    this.sprite.y = data.y
    this.sprite.alpha = data.alpha
    this.sprite.rotation = data.rotation || 0
    
    this.vx = data.vx
    this.vy = data.vy
    this.life = data.life || 300
    this.maxLife = this.life
    this.rotationSpeed = data.rotationSpeed || 0
  }

  update(delta: number): void {
    // Update position
    this.sprite.x += this.vx * delta
    this.sprite.y += this.vy * delta
    
    // Update rotation
    this.sprite.rotation += this.rotationSpeed * delta
    
    // Update life
    this.life -= delta
    
    // Fade out over time
    this.sprite.alpha = (this.life / this.maxLife) * 0.8
    
    // Apply gravity for some particle types
    this.vy += 0.01 * delta
  }

  isDead(): boolean {
    return this.life <= 0
  }
}