export * from '../lib/gameLogicSchema'

// Additional app-specific types
export interface ZambooState {
  mood: 'happy' | 'excited' | 'thinking' | 'celebrating' | 'encouraging'
  animation: 'idle' | 'dance' | 'jump' | 'clap' | 'thinking' | 'float'
  message?: string
}

export interface GameSession {
  id: string
  gameLogic: GameLogic
  startTime: Date
  endTime?: Date
  score: number
  completed: boolean
  timeSpent: number // in seconds
}

export interface UserProfile {
  id: string
  name?: string
  age?: number
  experience: 'beginner' | 'intermediate' | 'advanced'
  gamesCreated: number
  gamesPlayed: number
  favoriteGameTypes: string[]
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  category: 'creator' | 'player' | 'learner' | 'explorer'
}

export interface GameTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  difficulty: 'easy' | 'medium' | 'hard'
  concepts: string[]
  gameLogic: GameLogic
  featured: boolean
}

// DeepSeek API types
export interface DeepSeekRequest {
  prompt: string
  kidAgeBand: '5-7' | '8-10' | '11-13' | '14+'
  complexity?: 'simple' | 'medium' | 'complex'
  gameType?: 'collector' | 'maze' | 'runner' | 'puzzle' | 'adventure'
}

export interface DeepSeekResponse {
  success: boolean
  gameLogic?: GameLogic
  error?: string
  suggestions?: string[]
  zambooMessage?: string
}

// Phaser game engine integration types
export interface GameEngineConfig {
  width: number
  height: number
  gameLogic: GameLogic
  onScoreChange?: (score: number) => void
  onGameComplete?: (won: boolean, finalScore: number) => void
  onGameEvent?: (event: GameEvent) => void
}

export interface GameEngineRef {
  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  destroy: () => void
  getScore: () => number
  updateGameLogic: (newLogic: GameLogic) => void
}

// Blockly editor types
export interface BlocklyConfig {
  gameLogic: GameLogic
  onChange: (newLogic: GameLogic) => void
  readOnly?: boolean
  showCode?: boolean
}

export interface CodeBlock {
  type: string
  id: string
  values?: Record<string, any>
  statements?: Record<string, CodeBlock[]>
  next?: CodeBlock
}

// Voice recognition types
export interface VoiceConfig {
  language: 'en-US' | 'es-ES' | 'fr-FR' | 'de-DE'
  continuous: boolean
  interimResults: boolean
  onResult: (transcript: string) => void
  onError: (error: string) => void
}

// PWA and offline storage types
export interface OfflineGame {
  id: string
  gameLogic: GameLogic
  savedAt: Date
  playCount: number
  lastPlayed?: Date
}

export interface AppSettings {
  soundEnabled: boolean
  musicEnabled: boolean
  animationsEnabled: boolean
  voiceEnabled: boolean
  language: string
  theme: 'light' | 'dark' | 'auto'
  zambooPersonality: 'friendly' | 'energetic' | 'calm' | 'silly'
}

// Error types
export class GameValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'GameValidationError'
  }
}

export class DeepSeekError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'DeepSeekError'
  }
}

export class GameEngineError extends Error {
  constructor(message: string, public context?: any) {
    super(message)
    this.name = 'GameEngineError'
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> & 
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys]

// Import from gameLogicSchema for convenience
import type { GameLogic, GameEvent, GameObject, Concept } from '../lib/gameLogicSchema'