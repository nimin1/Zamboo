import * as PIXI from 'pixi.js'

export class AssetLoader {
  private textures: Map<string, PIXI.Texture> = new Map()
  private loadingPromises: Map<string, Promise<PIXI.Texture>> = new Map()

  async loadAssets(assetUrls: Record<string, string>): Promise<void> {
    const loadPromises = Object.entries(assetUrls).map(async ([key, url]) => {
      try {
        if (url === 'fallback') {
          // Skip loading, we'll create fallback later
          return
        }
        
        const texture = await PIXI.Assets.load(url)
        this.textures.set(key, texture)
      } catch (error) {
        console.warn(`Failed to load asset ${key} from ${url}:`, error)
        // Will use fallback
      }
    })

    await Promise.allSettled(loadPromises)
  }

  getTexture(key: string): PIXI.Texture {
    return this.textures.get(key) || this.createFallbackTexture(key)
  }

  createFallbackAssets(renderer: PIXI.Renderer): void {
    // Create fallback textures for common game objects
    this.textures.set('player', this.createPlayerTexture(renderer))
    this.textures.set('enemy', this.createEnemyTexture(renderer))
    this.textures.set('collectible', this.createCollectibleTexture(renderer))
    this.textures.set('platform', this.createPlatformTexture(renderer))
  }

  private createFallbackTexture(key: string): PIXI.Texture {
    // Create different fallback textures based on the key
    if (key.includes('player')) {
      return this.createSimplePlayerTexture()
    } else if (key.includes('enemy')) {
      return this.createSimpleEnemyTexture()
    } else if (key.includes('collectible')) {
      return this.createSimpleCollectibleTexture()
    } else {
      return this.createGenericTexture()
    }
  }

  private createSimplePlayerTexture(): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // Simple player character (panda-inspired)
    // Body
    graphics.circle(0, 0, 16)
    graphics.fill(0xF0F0F0) // Light gray for panda body
    
    // Head
    graphics.circle(0, -20, 12)
    graphics.fill(0xF0F0F0)
    
    // Ears
    graphics.circle(-8, -28, 4)
    graphics.circle(8, -28, 4)
    graphics.fill(0x000000) // Black ears
    
    // Eyes
    graphics.circle(-4, -22, 2)
    graphics.circle(4, -22, 2)
    graphics.fill(0x000000)
    
    // Eye patches
    graphics.circle(-4, -22, 4)
    graphics.circle(4, -22, 4)
    graphics.fill(0x333333)
    
    return this.graphicsToTexture(graphics)
  }

  private createSimpleEnemyTexture(): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // Simple enemy (spiky blob)
    graphics.circle(0, 0, 14)
    graphics.fill(0xFF4444) // Red
    
    // Spikes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x1 = Math.cos(angle) * 14
      const y1 = Math.sin(angle) * 14
      const x2 = Math.cos(angle) * 20
      const y2 = Math.sin(angle) * 20
      
      graphics.moveTo(0, 0)
      graphics.lineTo(x1, y1)
      graphics.lineTo(x2, y2)
      graphics.lineTo(x1, y1)
      graphics.fill(0xFF2222)
    }
    
    // Eyes
    graphics.circle(-6, -4, 2)
    graphics.circle(6, -4, 2)
    graphics.fill(0xFFFFFF)
    
    graphics.circle(-6, -4, 1)
    graphics.circle(6, -4, 1)
    graphics.fill(0x000000)
    
    return this.graphicsToTexture(graphics)
  }

  private createSimpleCollectibleTexture(): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // Star shape
    const points = []
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const radius = i % 2 === 0 ? 12 : 6
      points.push(Math.cos(angle) * radius, Math.sin(angle) * radius)
    }
    
    graphics.poly(points)
    graphics.fill(0xFFD700) // Gold
    
    // Inner glow
    graphics.circle(0, 0, 6)
    graphics.fill(0xFFFF88)
    
    return this.graphicsToTexture(graphics)
  }

  private createPlayerTexture(renderer: PIXI.Renderer): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // More detailed player character
    // Body with gradient effect (simulated with multiple circles)
    for (let i = 0; i < 5; i++) {
      const alpha = 1 - (i * 0.15)
      const radius = 16 - (i * 1)
      graphics.circle(0, 0, radius)
      graphics.fill({ color: 0xF0F0F0, alpha })
    }
    
    // Head
    graphics.circle(0, -20, 12)
    graphics.fill(0xF0F0F0)
    
    // Ears with inner detail
    graphics.circle(-8, -28, 4)
    graphics.circle(8, -28, 4)
    graphics.fill(0x000000)
    
    graphics.circle(-8, -28, 2)
    graphics.circle(8, -28, 2)
    graphics.fill(0x444444)
    
    // Eye patches
    graphics.circle(-5, -22, 5)
    graphics.circle(5, -22, 5)
    graphics.fill(0x000000)
    
    // Eyes
    graphics.circle(-4, -22, 3)
    graphics.circle(4, -22, 3)
    graphics.fill(0xFFFFFF)
    
    graphics.circle(-3, -21, 2)
    graphics.circle(3, -21, 2)
    graphics.fill(0x000000)
    
    // Nose
    graphics.circle(0, -18, 1)
    graphics.fill(0x000000)
    
    return this.graphicsToTexture(graphics)
  }

  private createEnemyTexture(renderer: PIXI.Renderer): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // Animated-looking enemy with more detail
    // Body
    graphics.circle(0, 0, 16)
    graphics.fill(0xFF3333)
    
    // Shadow/depth
    graphics.circle(0, 2, 14)
    graphics.fill(0xDD2222)
    
    // Spikes with better shading
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const x1 = Math.cos(angle) * 16
      const y1 = Math.sin(angle) * 16
      const x2 = Math.cos(angle) * 24
      const y2 = Math.sin(angle) * 24
      
      // Spike
      graphics.moveTo(x1, y1)
      graphics.lineTo(x2, y2)
      graphics.lineTo(Math.cos(angle + 0.3) * 18, Math.sin(angle + 0.3) * 18)
      graphics.fill(0xFF4444)
      
      // Spike shadow
      graphics.moveTo(x1, y1)
      graphics.lineTo(x2, y2)
      graphics.lineTo(Math.cos(angle - 0.3) * 18, Math.sin(angle - 0.3) * 18)
      graphics.fill(0xCC2222)
    }
    
    // Eyes
    graphics.circle(-6, -6, 3)
    graphics.circle(6, -6, 3)
    graphics.fill(0xFFFFFF)
    
    graphics.circle(-5, -5, 2)
    graphics.circle(5, -5, 2)
    graphics.fill(0xFF0000)
    
    graphics.circle(-4, -4, 1)
    graphics.circle(4, -4, 1)
    graphics.fill(0x000000)
    
    return this.graphicsToTexture(graphics)
  }

  private createCollectibleTexture(renderer: PIXI.Renderer): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // Bamboo stick (more detailed)
    // Main stalk
    graphics.rect(-3, -20, 6, 40)
    graphics.fill(0x90EE90) // Light green
    
    // Segments
    for (let i = -15; i < 20; i += 10) {
      graphics.rect(-4, i - 1, 8, 2)
      graphics.fill(0x228B22) // Dark green
    }
    
    // Leaves
    graphics.ellipse(-8, -15, 6, 3)
    graphics.ellipse(8, -10, 6, 3)
    graphics.ellipse(-6, 5, 5, 2)
    graphics.fill(0x32CD32) // Lime green
    
    // Highlight
    graphics.rect(-1, -18, 1, 36)
    graphics.fill(0xB0FFB0)
    
    return this.graphicsToTexture(graphics)
  }

  private createPlatformTexture(renderer: PIXI.Renderer): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // Stone platform
    graphics.rect(0, 0, 120, 20)
    graphics.fill(0x696969)
    
    // Top highlight
    graphics.rect(0, 0, 120, 3)
    graphics.fill(0x888888)
    
    // Bottom shadow
    graphics.rect(0, 17, 120, 3)
    graphics.fill(0x444444)
    
    // Cracks/detail
    graphics.moveTo(20, 0)
    graphics.lineTo(22, 20)
    graphics.stroke({ color: 0x555555, width: 1 })
    
    graphics.moveTo(60, 0)
    graphics.lineTo(58, 20)
    graphics.stroke({ color: 0x555555, width: 1 })
    
    graphics.moveTo(100, 0)
    graphics.lineTo(102, 20)
    graphics.stroke({ color: 0x555555, width: 1 })
    
    return this.graphicsToTexture(graphics)
  }

  private createGenericTexture(): PIXI.Texture {
    const graphics = new PIXI.Graphics()
    
    // Simple colored rectangle
    graphics.rect(0, 0, 32, 32)
    graphics.fill(0x888888)
    
    graphics.rect(2, 2, 28, 28)
    graphics.fill(0xAAAAAA)
    
    return this.graphicsToTexture(graphics)
  }

  private graphicsToTexture(graphics: PIXI.Graphics): PIXI.Texture {
    // Convert graphics to texture
    return PIXI.RenderTexture.create({
      width: 64,
      height: 64
    })
  }

  destroy(): void {
    this.textures.forEach(texture => {
      if (texture.destroy) {
        texture.destroy()
      }
    })
    
    this.textures.clear()
    this.loadingPromises.clear()
  }
}