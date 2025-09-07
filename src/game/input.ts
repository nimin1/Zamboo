import { Controls } from '../types/gamespec'

export class InputManager {
  private canvas: HTMLCanvasElement | null = null
  private spec: Controls
  private keys: Set<string> = new Set()
  
  // Event handlers
  public onKeyDown: ((key: string) => void) | null = null
  public onKeyUp: ((key: string) => void) | null = null
  public onTouch: ((x: number, y: number) => void) | null = null
  public onPointerMove: ((x: number, y: number) => void) | null = null

  constructor(controlsSpec: Controls) {
    this.spec = controlsSpec
    this.setupEventListeners()
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.setupCanvasEvents()
  }

  private setupEventListeners(): void {
    if (this.spec.keyboard) {
      document.addEventListener('keydown', this.handleKeyDown.bind(this))
      document.addEventListener('keyup', this.handleKeyUp.bind(this))
    }
  }

  private setupCanvasEvents(): void {
    if (!this.canvas) return

    if (this.spec.touch) {
      // Touch events for mobile
      this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
      this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
      this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
      
      // Mouse events for desktop
      this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
      this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    }

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }

  private handleKeyDown(event: KeyboardEvent): void {
    event.preventDefault()
    
    const key = this.normalizeKey(event.code || event.key)
    if (!this.keys.has(key)) {
      this.keys.add(key)
      
      if (this.onKeyDown) {
        this.onKeyDown(key)
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    event.preventDefault()
    
    const key = this.normalizeKey(event.code || event.key)
    this.keys.delete(key)
    
    if (this.onKeyUp) {
      this.onKeyUp(key)
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault()
    
    if (event.touches.length > 0) {
      const touch = event.touches[0]
      const rect = this.canvas!.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      if (this.onTouch) {
        this.onTouch(x, y)
      }
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault()
    
    if (event.touches.length > 0) {
      const touch = event.touches[0]
      const rect = this.canvas!.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      
      if (this.onPointerMove) {
        this.onPointerMove(x, y)
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault()
  }

  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault()
    
    const rect = this.canvas!.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    if (this.onTouch) {
      this.onTouch(x, y)
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas!.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    if (this.onPointerMove) {
      this.onPointerMove(x, y)
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    event.preventDefault()
  }

  private normalizeKey(key: string): string {
    // Normalize key codes to consistent names
    const keyMap: Record<string, string> = {
      'ArrowUp': 'ArrowUp',
      'ArrowDown': 'ArrowDown', 
      'ArrowLeft': 'ArrowLeft',
      'ArrowRight': 'ArrowRight',
      'Space': 'Space',
      ' ': 'Space',
      'KeyW': 'KeyW',
      'KeyA': 'KeyA',
      'KeyS': 'KeyS',
      'KeyD': 'KeyD',
      'KeyZ': 'KeyZ',
      'KeyX': 'KeyX',
      'Enter': 'Enter',
      'Escape': 'Escape'
    }
    
    return keyMap[key] || key
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.has(key)
  }

  public getMovementInput(): { x: number, y: number } {
    let x = 0
    let y = 0
    
    // Arrow keys
    if (this.isKeyPressed('ArrowLeft')) x -= 1
    if (this.isKeyPressed('ArrowRight')) x += 1
    if (this.isKeyPressed('ArrowUp')) y -= 1
    if (this.isKeyPressed('ArrowDown')) y += 1
    
    // WASD keys
    if (this.isKeyPressed('KeyA')) x -= 1
    if (this.isKeyPressed('KeyD')) x += 1
    if (this.isKeyPressed('KeyW')) y -= 1
    if (this.isKeyPressed('KeyS')) y += 1
    
    return { x, y }
  }

  public isJumpPressed(): boolean {
    return this.isKeyPressed('Space') || this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW')
  }

  public isActionPressed(): boolean {
    return this.isKeyPressed('KeyZ') || this.isKeyPressed('KeyX') || this.isKeyPressed('Enter')
  }

  public destroy(): void {
    // Remove event listeners
    if (this.spec.keyboard) {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this))
      document.removeEventListener('keyup', this.handleKeyUp.bind(this))
    }

    if (this.canvas && this.spec.touch) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this))
      this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this))
      this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this))
      this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this))
      this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this))
      this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this))
    }

    this.keys.clear()
    this.canvas = null
    this.onKeyDown = null
    this.onKeyUp = null
    this.onTouch = null
    this.onPointerMove = null
  }
}