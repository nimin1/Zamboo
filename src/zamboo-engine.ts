import * as PIXI from 'pixi.js'
import { GameSpec, validateGameSpec, getThemeDefaults } from './types/gamespec'
import { ParticleSystem } from './game/particles'
import { AudioManager } from './game/audio'
import { InputManager } from './game/input'
import { AssetLoader } from './game/assets'

export class ZambooGameEngine {
  private app: PIXI.Application
  private spec: GameSpec
  private gameContainer: PIXI.Container
  private backgroundContainer: PIXI.Container
  private gameObjectsContainer: PIXI.Container
  private uiContainer: PIXI.Container
  private particles: ParticleSystem
  private audio: AudioManager
  private input: InputManager
  private assets: AssetLoader
  
  // Game entities
  private player: PIXI.Sprite | null = null
  private enemies: PIXI.Sprite[] = []
  private collectibles: PIXI.Sprite[] = []
  private platforms: PIXI.Graphics[] = []
  
  // Game state
  private isRunning = false
  private score = 0
  private health = 100
  private gameTime = 0
  
  // Performance tracking
  private frameCount = 0
  private fpsCounter = 0
  private lastFPSUpdate = 0

  constructor(rootElement: HTMLElement, spec: GameSpec) {
    this.spec = spec
    
    // Initialize PIXI Application with optimizations
    this.app = new PIXI.Application()
    
    this.gameContainer = new PIXI.Container()
    this.backgroundContainer = new PIXI.Container()
    this.gameObjectsContainer = new PIXI.Container()
    this.uiContainer = new PIXI.Container()
    
    // Initialize subsystems
    this.particles = new ParticleSystem()
    this.audio = new AudioManager(spec.audio)
    this.input = new InputManager(spec.controls)
    this.assets = new AssetLoader()
    
    this.init(rootElement)
  }

  private async init(rootElement: HTMLElement): Promise<void> {
    try {
      // Initialize PIXI app
      await this.app.init({
        width: 1024,
        height: 768,
        backgroundColor: this.spec.palette.bg,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      })

      // Add canvas to DOM
      rootElement.appendChild(this.app.canvas)
      
      // Setup container hierarchy
      this.app.stage.addChild(this.backgroundContainer)
      this.app.stage.addChild(this.gameContainer)
      this.app.stage.addChild(this.uiContainer)
      
      this.gameContainer.addChild(this.gameObjectsContainer)
      
      // Load assets
      await this.loadAssets()
      
      // Initialize game systems
      this.setupBackground()
      this.setupPlayer()
      this.setupEnemies()
      this.setupCollectibles()
      this.setupPlatforms()
      this.setupUI()
      this.setupParticles()
      
      // Setup input handling
      this.input.init(this.app.canvas)
      this.setupInputHandlers()
      
      // Start game loop
      this.app.ticker.add((ticker) => this.update(ticker.deltaMS / 1000))
      this.isRunning = true
      
      console.log('🎮 Zamboo game engine initialized successfully!')
      
    } catch (error) {
      console.error('❌ Failed to initialize Zamboo engine:', error)
      throw error
    }
  }

  private async loadAssets(): Promise<void> {
    // Define asset URLs based on theme and spec
    const assetUrls = this.generateAssetUrls()
    
    try {
      await this.assets.loadAssets(assetUrls)
      console.log('✅ Assets loaded successfully')
    } catch (error) {
      console.warn('⚠️ Some assets failed to load, using fallbacks:', error)
      this.assets.createFallbackAssets(this.app.renderer)
    }
  }

  private generateAssetUrls(): Record<string, string> {
    // Generate procedural asset URLs or use fallbacks
    return {
      player: this.spec.player.sprite || 'fallback',
      ...this.spec.enemies.reduce((acc, enemy, i) => {
        acc[`enemy_${i}`] = enemy.sprite || 'fallback'
        return acc
      }, {} as Record<string, string>),
      ...this.spec.collectibles.reduce((acc, collectible, i) => {
        acc[`collectible_${i}`] = collectible.sprite || 'fallback'
        return acc
      }, {} as Record<string, string>)
    }
  }

  private setupBackground(): void {
    // Create parallax background layers
    for (let i = 0; i < this.spec.camera.parallaxLayers; i++) {
      const layer = this.createBackgroundLayer(i)
      this.backgroundContainer.addChild(layer)
    }
    
    // Add theme-specific ambient effects
    this.addAmbientEffects()
  }

  private createBackgroundLayer(layerIndex: number): PIXI.Container {
    const layer = new PIXI.Container()
    const graphics = new PIXI.Graphics()
    
    // Create gradient background for this layer
    const color1 = parseInt(this.spec.palette.bg.slice(1), 16)
    const color2 = parseInt(this.spec.palette.secondary.slice(1), 16)
    
    // Create gradient using a rectangle with alpha variation
    const width = this.app.screen.width * (layerIndex + 1)
    const height = this.app.screen.height
    
    graphics.rect(0, 0, width, height)
    graphics.fill({
      color: layerIndex === 0 ? color1 : color2,
      alpha: 1 - (layerIndex * 0.2)
    })
    
    layer.addChild(graphics)
    
    // Add theme-specific decorations
    this.addThemeDecorations(layer, layerIndex)
    
    return layer
  }

  private addThemeDecorations(layer: PIXI.Container, layerIndex: number): void {
    // Add theme-appropriate decorative elements
    switch (this.spec.theme) {
      case 'forest':
        this.addForestDecorations(layer, layerIndex)
        break
      case 'ocean':
        this.addOceanDecorations(layer, layerIndex)
        break
      case 'space':
        this.addSpaceDecorations(layer, layerIndex)
        break
      // Add more themes...
    }
  }

  private addForestDecorations(layer: PIXI.Container, layerIndex: number): void {
    const treeCount = Math.max(1, 5 - layerIndex)
    for (let i = 0; i < treeCount; i++) {
      const tree = this.createTree()
      tree.x = (this.app.screen.width / treeCount) * i + Math.random() * 100
      tree.y = this.app.screen.height - 100 - (layerIndex * 50)
      tree.scale.set(0.5 + (layerIndex * 0.2))
      layer.addChild(tree)
    }
  }

  private addOceanDecorations(layer: PIXI.Container, layerIndex: number): void {
    // Add waves, coral, fish silhouettes
    const waveGraphics = new PIXI.Graphics()
    waveGraphics.moveTo(0, this.app.screen.height - 50)
    
    for (let x = 0; x < this.app.screen.width; x += 10) {
      const waveHeight = Math.sin(x * 0.02) * 20
      waveGraphics.lineTo(x, this.app.screen.height - 50 + waveHeight)
    }
    
    waveGraphics.stroke({ color: this.spec.palette.primary, width: 2 })
    layer.addChild(waveGraphics)
  }

  private addSpaceDecorations(layer: PIXI.Container, layerIndex: number): void {
    // Add stars, nebula, planets
    const starCount = Math.max(10, 50 - (layerIndex * 10))
    for (let i = 0; i < starCount; i++) {
      const star = new PIXI.Graphics()
      star.circle(0, 0, 1 + Math.random() * 2)
      star.fill(0xFFFFFF)
      
      star.x = Math.random() * this.app.screen.width
      star.y = Math.random() * this.app.screen.height
      star.alpha = 0.3 + Math.random() * 0.7
      
      layer.addChild(star)
    }
  }

  private createTree(): PIXI.Graphics {
    const tree = new PIXI.Graphics()
    
    // Tree trunk
    tree.rect(-10, -50, 20, 50)
    tree.fill(0x8B4513)
    
    // Tree crown
    tree.circle(0, -50, 30)
    tree.fill(parseInt(this.spec.palette.primary.slice(1), 16))
    
    return tree
  }

  private addAmbientEffects(): void {
    // Add weather and ambient particle effects based on theme
    if (this.spec.effects.weather !== 'none') {
      this.particles.createWeatherSystem(this.spec.effects.weather, this.backgroundContainer)
    }
  }

  private setupPlayer(): void {
    // Try to load player sprite or create fallback
    const playerTexture = this.assets.getTexture('player')
    this.player = new PIXI.Sprite(playerTexture)
    
    this.player.x = 100
    this.player.y = this.app.screen.height - 200
    this.player.scale.set(0.8)
    
    // Setup player animations and physics
    this.setupPlayerPhysics()
    
    this.gameObjectsContainer.addChild(this.player)
  }

  private setupPlayerPhysics(): void {
    if (!this.player) return
    
    // Add physics properties
    const playerSprite = this.player as any
    playerSprite.velocity = { x: 0, y: 0 }
    playerSprite.grounded = false
    playerSprite.speed = this.spec.player.speed
  }

  private setupEnemies(): void {
    this.spec.enemies.forEach((enemySpec, i) => {
      const texture = this.assets.getTexture(`enemy_${i}`)
      const enemy = new PIXI.Sprite(texture)
      
      enemy.x = 300 + (i * 200)
      enemy.y = this.app.screen.height - 150
      enemy.scale.set(0.6)
      
      // Add enemy AI properties
      ;(enemy as any).behavior = enemySpec.behavior
      ;(enemy as any).speed = enemySpec.speed
      ;(enemy as any).direction = Math.random() > 0.5 ? 1 : -1
      
      this.enemies.push(enemy)
      this.gameObjectsContainer.addChild(enemy)
    })
  }

  private setupCollectibles(): void {
    this.spec.collectibles.forEach((collectibleSpec, i) => {
      // Create multiple instances of each collectible type
      for (let j = 0; j < 3; j++) {
        const texture = this.assets.getTexture(`collectible_${i}`)
        const collectible = new PIXI.Sprite(texture)
        
        collectible.x = 200 + (j * 150) + (i * 50)
        collectible.y = this.app.screen.height - 250 - (Math.random() * 100)
        collectible.scale.set(0.5)
        
        // Add collectible properties
        ;(collectible as any).value = collectibleSpec.value
        ;(collectible as any).collected = false
        ;(collectible as any).originalY = collectible.y
        
        this.collectibles.push(collectible)
        this.gameObjectsContainer.addChild(collectible)
      }
    })
  }

  private setupPlatforms(): void {
    // Generate platforms based on level configuration
    const platformCount = this.spec.level.segments
    
    for (let i = 0; i < platformCount; i++) {
      const platform = new PIXI.Graphics()
      
      const width = 120 + Math.random() * 80
      const height = 20
      const x = 150 + (i * 200)
      const y = this.app.screen.height - 100 - (Math.random() * 150)
      
      platform.rect(0, 0, width, height)
      platform.fill(parseInt(this.spec.palette.primary.slice(1), 16))
      
      platform.x = x
      platform.y = y
      
      this.platforms.push(platform)
      this.gameObjectsContainer.addChild(platform)
    }
  }

  private setupUI(): void {
    if (this.spec.ui.showScore) {
      this.createScoreDisplay()
    }
    
    if (this.spec.ui.showHealth) {
      this.createHealthDisplay()
    }
    
    if (this.spec.ui.tutorial) {
      this.createTutorialOverlay()
    }
  }

  private createScoreDisplay(): void {
    const scoreText = new PIXI.Text({
      text: 'Score: 0',
      style: {
        fontSize: 24,
        fill: this.spec.palette.primary,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold'
      }
    })
    
    scoreText.x = 20
    scoreText.y = 20
    
    ;(scoreText as any).isScoreText = true
    this.uiContainer.addChild(scoreText)
  }

  private createHealthDisplay(): void {
    const healthBar = new PIXI.Graphics()
    healthBar.x = 20
    healthBar.y = 60
    
    ;(healthBar as any).isHealthBar = true
    this.uiContainer.addChild(healthBar)
    this.updateHealthBar()
  }

  private updateHealthBar(): void {
    const healthBar = this.uiContainer.children.find(child => (child as any).isHealthBar) as PIXI.Graphics
    if (!healthBar) return
    
    healthBar.clear()
    
    // Background
    healthBar.rect(0, 0, 100, 10)
    healthBar.fill(0x333333)
    
    // Health fill
    const healthWidth = (this.health / 100) * 100
    healthBar.rect(0, 0, healthWidth, 10)
    healthBar.fill(this.health > 50 ? 0x00FF00 : this.health > 25 ? 0xFFFF00 : 0xFF0000)
  }

  private createTutorialOverlay(): void {
    // Create simple tutorial text
    const tutorialText = new PIXI.Text({
      text: 'Use ARROW KEYS to move and SPACE to jump!',
      style: {
        fontSize: 18,
        fill: this.spec.palette.accent,
        fontFamily: 'Arial, sans-serif',
        align: 'center'
      }
    })
    
    tutorialText.x = this.app.screen.width / 2 - tutorialText.width / 2
    tutorialText.y = this.app.screen.height - 50
    
    this.uiContainer.addChild(tutorialText)
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (tutorialText.parent) {
        tutorialText.parent.removeChild(tutorialText)
      }
    }, 5000)
  }

  private setupParticles(): void {
    this.particles.init(this.gameObjectsContainer)
    
    // Create ambient particle effects
    this.spec.effects.particles.forEach(particleType => {
      this.particles.createAmbientSystem(particleType, this.spec.palette)
    })
  }

  private setupInputHandlers(): void {
    this.input.onKeyDown = (key: string) => {
      if (!this.player) return
      
      switch (key) {
        case 'ArrowLeft':
          this.movePlayer(-1)
          break
        case 'ArrowRight':
          this.movePlayer(1)
          break
        case 'Space':
          this.playerJump()
          break
      }
    }
    
    this.input.onTouch = (x: number, y: number) => {
      if (!this.player) return
      
      // Simple touch controls - move towards touch point
      const playerCenterX = this.player.x + this.player.width / 2
      if (x < playerCenterX - 50) {
        this.movePlayer(-1)
      } else if (x > playerCenterX + 50) {
        this.movePlayer(1)
      } else {
        this.playerJump()
      }
    }
  }

  private movePlayer(direction: number): void {
    if (!this.player) return
    
    const velocity = (this.player as any).velocity
    velocity.x = direction * ((this.player as any).speed / 60) // 60fps target
  }

  private playerJump(): void {
    if (!this.player) return
    
    const velocity = (this.player as any).velocity
    if ((this.player as any).grounded && this.spec.player.abilities.includes('jump')) {
      velocity.y = -8 // Jump strength
      ;(this.player as any).grounded = false
      this.audio.playSound('jump')
    }
  }

  private update(delta: number): void {
    if (!this.isRunning) return
    
    this.gameTime += delta
    this.updateFPS(delta)
    
    this.updatePlayer(delta)
    this.updateEnemies(delta)
    this.updateCollectibles(delta)
    this.updateCollisions()
    this.updateParticles(delta)
    this.updateCamera()
    
    // Check win/lose conditions
    this.checkGameConditions()
  }

  private updateFPS(delta: number): void {
    this.frameCount++
    this.lastFPSUpdate += delta
    
    if (this.lastFPSUpdate >= 60) { // Update FPS counter every second
      this.fpsCounter = Math.round(this.frameCount / (this.lastFPSUpdate / 60))
      this.frameCount = 0
      this.lastFPSUpdate = 0
    }
  }

  private updatePlayer(delta: number): void {
    if (!this.player) return
    
    const velocity = (this.player as any).velocity
    
    // Apply gravity
    velocity.y += 0.5 * delta
    
    // Apply velocity
    this.player.x += velocity.x * delta
    this.player.y += velocity.y * delta
    
    // Apply friction
    velocity.x *= 0.9
    
    // Ground collision
    const groundY = this.app.screen.height - 100
    if (this.player.y + this.player.height > groundY) {
      this.player.y = groundY - this.player.height
      velocity.y = 0
      ;(this.player as any).grounded = true
    }
    
    // Screen bounds
    this.player.x = Math.max(0, Math.min(this.app.screen.width - this.player.width, this.player.x))
  }

  private updateEnemies(delta: number): void {
    this.enemies.forEach(enemy => {
      const behavior = (enemy as any).behavior
      const speed = (enemy as any).speed
      
      switch (behavior) {
        case 'patrol':
          enemy.x += (enemy as any).direction * (speed / 60) * delta
          
          // Reverse direction at screen edges
          if (enemy.x <= 0 || enemy.x >= this.app.screen.width - enemy.width) {
            ;(enemy as any).direction *= -1
          }
          break
          
        case 'chase':
          if (this.player) {
            const dx = this.player.x - enemy.x
            const distance = Math.abs(dx)
            
            if (distance > 10) {
              enemy.x += Math.sign(dx) * (speed / 60) * delta
            }
          }
          break
      }
    })
  }

  private updateCollectibles(delta: number): void {
    this.collectibles.forEach(collectible => {
      if ((collectible as any).collected) return
      
      // Float animation
      const originalY = (collectible as any).originalY
      collectible.y = originalY + Math.sin(this.gameTime * 0.03) * 10
      
      // Rotate
      collectible.rotation += 0.02 * delta
    })
  }

  private updateCollisions(): void {
    if (!this.player) return
    
    // Player-collectible collisions
    this.collectibles.forEach(collectible => {
      if ((collectible as any).collected) return
      
      if (this.checkCollision(this.player!, collectible)) {
        this.collectItem(collectible)
      }
    })
    
    // Player-enemy collisions
    this.enemies.forEach(enemy => {
      if (this.checkCollision(this.player!, enemy)) {
        this.playerHurt()
      }
    })
  }

  private checkCollision(a: PIXI.Container, b: PIXI.Container): boolean {
    const aBounds = a.getBounds()
    const bBounds = b.getBounds()
    
    return aBounds.x < bBounds.x + bBounds.width &&
           aBounds.x + aBounds.width > bBounds.x &&
           aBounds.y < bBounds.y + bBounds.height &&
           aBounds.y + aBounds.height > bBounds.y
  }

  private collectItem(collectible: PIXI.Sprite): void {
    ;(collectible as any).collected = true
    collectible.visible = false
    
    const value = (collectible as any).value || 10
    this.score += value
    
    // Update score display
    const scoreText = this.uiContainer.children.find(child => (child as any).isScoreText) as PIXI.Text
    if (scoreText) {
      scoreText.text = `Score: ${this.score}`
    }
    
    // Spawn collection particle effect
    this.particles.createBurst(collectible.x, collectible.y, this.spec.palette.accent)
    
    // Play sound
    this.audio.playSound('collect')
  }

  private playerHurt(): void {
    this.health -= 10
    this.updateHealthBar()
    this.audio.playSound('hurt')
    
    // Flash effect
    if (this.player) {
      this.player.tint = 0xFF0000
      setTimeout(() => {
        if (this.player) this.player.tint = 0xFFFFFF
      }, 200)
    }
  }

  private updateParticles(delta: number): void {
    this.particles.update(delta)
  }

  private updateCamera(): void {
    // Simple camera follow for side-scrolling
    if (this.spec.camera.type === 'side' && this.player) {
      const targetX = this.app.screen.width / 2 - this.player.x
      this.gameContainer.x += (targetX - this.gameContainer.x) * 0.1
    }
  }

  private checkGameConditions(): void {
    // Check win condition
    if (this.spec.level.goal === 'collect-N') {
      if (this.score >= this.spec.level.goalValue) {
        this.gameWin()
      }
    }
    
    // Check lose condition
    if (this.health <= 0) {
      this.gameOver()
    }
  }

  private gameWin(): void {
    this.isRunning = false
    this.audio.playSound('victory')
    
    // Show victory message
    const victoryText = new PIXI.Text({
      text: 'YOU WIN!',
      style: {
        fontSize: 48,
        fill: this.spec.palette.accent,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold'
      }
    })
    
    victoryText.x = this.app.screen.width / 2 - victoryText.width / 2
    victoryText.y = this.app.screen.height / 2 - victoryText.height / 2
    
    this.uiContainer.addChild(victoryText)
    
    // Victory particles
    this.particles.createVictoryEffect(this.app.screen.width / 2, this.app.screen.height / 2)
  }

  private gameOver(): void {
    this.isRunning = false
    
    // Show game over message
    const gameOverText = new PIXI.Text({
      text: 'GAME OVER',
      style: {
        fontSize: 48,
        fill: '#FF0000',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold'
      }
    })
    
    gameOverText.x = this.app.screen.width / 2 - gameOverText.width / 2
    gameOverText.y = this.app.screen.height / 2 - gameOverText.height / 2
    
    this.uiContainer.addChild(gameOverText)
  }

  // Public API
  public getFPS(): number {
    return this.fpsCounter
  }

  public getScore(): number {
    return this.score
  }

  public isGameRunning(): boolean {
    return this.isRunning
  }

  public destroy(): void {
    this.isRunning = false
    
    // Clean up subsystems
    this.particles.destroy()
    this.audio.destroy()
    this.input.destroy()
    
    // Clean up PIXI
    this.app.destroy(true, { children: true })
    
    console.log('🎮 Zamboo engine destroyed')
  }
}

// Main factory function
export async function createZambooGame(root: HTMLElement, spec: GameSpec): Promise<ZambooGameEngine> {
  // Validate the spec
  const validation = validateGameSpec(spec)
  if (!validation) {
    throw new Error(`Invalid GameSpec`)
  }
  
  // Apply theme defaults
  const themeDefaults = getThemeDefaults(validation.theme)
  const finalSpec: GameSpec = { ...themeDefaults, ...validation }
  
  // Create and return the engine
  const engine = new ZambooGameEngine(root, finalSpec)
  return engine
}