import { z } from 'zod'

// GameSpec Architecture for Zamboo - Enhanced Template-Based System
// This defines structured specifications for generating consistent, high-quality games

// Core Template Types
export type GameTemplate = 'platformer' | 'endless-runner' | 'top-down-collector'
export type ThemePack = 'forest' | 'space' | 'ocean'

// Theme enum for consistent game theming
export const GameTheme = z.enum([
  'forest', 'ocean', 'space', 'city', 'desert', 'snow', 'candy', 'farm', 'castle', 'underwater', 'custom'
])

// Template enum for game structure
export const GameTemplateSchema = z.enum(['platformer', 'endless-runner', 'top-down-collector'])

// Theme pack enum for curated assets
export const ThemePackSchema = z.enum(['forest', 'space', 'ocean'])

// Camera configuration for different game perspectives
export const CameraConfigSchema = z.object({
  type: z.enum(['side', 'top', 'isometric']),
  parallaxLayers: z.number().min(1).max(10).default(3)
})

// Color palette for consistent theming
export const PaletteSchema = z.object({
  primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  bg: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
})

// Hitbox for collision detection
export const HitboxSchema = z.object({
  w: z.number().positive(),
  h: z.number().positive()
})

// Player character configuration
export const PlayerSchema = z.object({
  sprite: z.string().url().optional().or(z.string()), // Can be URL or asset name
  hitbox: HitboxSchema,
  speed: z.number().positive().default(280),
  abilities: z.array(z.enum(['jump', 'dash', 'fly', 'swim', 'climb'])).default(['jump']),
  idleAnim: z.string().default('idle'),
  runAnim: z.string().default('run'),
  jumpAnim: z.string().default('jump')
})

// Enemy configuration
export const EnemySchema = z.object({
  name: z.string(),
  sprite: z.string(),
  behavior: z.enum(['patrol', 'chase', 'static', 'jump', 'fly']).default('patrol'),
  speed: z.number().positive().default(160),
  hp: z.number().positive().default(1)
})

// Collectible items
export const CollectibleSchema = z.object({
  name: z.string(),
  sprite: z.string(),
  value: z.number().positive().default(10),
  particle: z.string().default('sparkle')
})

// Level structure and objectives
export const LevelSchema = z.object({
  segments: z.number().positive().default(4),
  length: z.number().positive().default(3200),
  platforms: z.enum(['auto', 'manual', 'none']).default('auto'),
  obstacles: z.array(z.string()).default([]),
  goal: z.enum(['collect-N', 'reach-end', 'defeat-boss', 'survive-time']).default('collect-N'),
  goalValue: z.number().positive().default(50)
})

// Visual effects and particles
export const EffectsSchema = z.object({
  particles: z.array(z.string()).default(['sparkle']),
  filters: z.array(z.string()).default([]),
  weather: z.enum(['none', 'snow', 'rain', 'floating-leaves', 'bubbles']).default('none')
})

// Audio configuration
export const AudioSchema = z.object({
  music: z.string().default('loop1'),
  sfx: z.record(z.string(), z.string()).default({
    jump: 'jump1',
    collect: 'coin1',
    hurt: 'hurt1',
    victory: 'victory1'
  })
})

// Control scheme
export const ControlsSchema = z.object({
  keyboard: z.boolean().default(true),
  touch: z.boolean().default(true),
  gamepad: z.boolean().default(false)
})

// Difficulty settings
export const DifficultySchema = z.enum(['easy', 'normal', 'hard']).default('normal')

// UI configuration
export const UISchema = z.object({
  showScore: z.boolean().default(true),
  showHealth: z.boolean().default(false),
  showTimer: z.boolean().default(false),
  tutorial: z.boolean().default(true)
})

// Enhanced Main GameSpec schema with template system
export const GameSpecSchema = z.object({
  // Basic Game Info
  title: z.string().min(1).max(50),
  description: z.string().min(10).max(200),
  ageGroup: z.enum(['4-6', '7-9', '10-12']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  
  // Core Architecture - NEW: Template-based system
  template: GameTemplateSchema,
  themePack: ThemePackSchema,
  
  // Legacy fields for compatibility
  theme: GameTheme,
  camera: CameraConfigSchema,
  palette: PaletteSchema,
  
  // Game Components
  player: PlayerSchema,
  enemies: z.array(EnemySchema).default([]),
  collectibles: z.array(CollectibleSchema).default([]),
  level: LevelSchema,
  effects: EffectsSchema,
  audio: AudioSchema,
  controls: ControlsSchema,
  ui: UISchema,
  
  // Educational Context
  codingConcepts: z.array(z.string()).min(1).max(5).default(['loops']),
  learningObjectives: z.array(z.string()).min(1).max(3).default(['Learn game mechanics']),
  
  // Win Conditions
  winCondition: z.enum(['collect-all', 'reach-goal', 'survive-time', 'score-target']).default('collect-all'),
  winTarget: z.number().min(1).default(10),
  
  // Zamboo Personality
  zambooMessages: z.object({
    welcome: z.string(),
    encouragement: z.string(),
    victory: z.string(),
    instructions: z.string()
  }),
  
  // Metadata
  createdBy: z.string().default('zamboo-ai'),
  createdAt: z.string().default(() => new Date().toISOString()),
  version: z.string().default('1.0.0')
})

// TypeScript types
export type GameTheme = z.infer<typeof GameTheme>
export type CameraConfig = z.infer<typeof CameraConfigSchema>
export type Palette = z.infer<typeof PaletteSchema>
export type Hitbox = z.infer<typeof HitboxSchema>
export type Player = z.infer<typeof PlayerSchema>
export type Enemy = z.infer<typeof EnemySchema>
export type Collectible = z.infer<typeof CollectibleSchema>
export type Level = z.infer<typeof LevelSchema>
export type Effects = z.infer<typeof EffectsSchema>
export type Audio = z.infer<typeof AudioSchema>
export type Controls = z.infer<typeof ControlsSchema>
export type Difficulty = z.infer<typeof DifficultySchema>
export type UI = z.infer<typeof UISchema>
export type GameSpec = z.infer<typeof GameSpecSchema>

// Legacy validation function (replaced by improved version below)
// Keeping for backward compatibility - see validateGameSpec below

// Theme-based default palettes
export const THEME_PALETTES: Record<GameTheme, Palette> = {
  forest: {
    primary: '#228B22',   // Forest green
    secondary: '#8B4513', // Saddle brown
    accent: '#FFD700',    // Gold
    bg: '#87CEEB'         // Sky blue
  },
  ocean: {
    primary: '#0077BE',   // Ocean blue
    secondary: '#20B2AA', // Light sea green  
    accent: '#FFD700',    // Gold
    bg: '#87CEEB'         // Light blue
  },
  space: {
    primary: '#4B0082',   // Indigo
    secondary: '#8A2BE2', // Blue violet
    accent: '#FFD700',    // Gold
    bg: '#000033'         // Dark blue
  },
  city: {
    primary: '#696969',   // Dim gray
    secondary: '#4682B4', // Steel blue
    accent: '#FF6347',    // Tomato
    bg: '#87CEEB'         // Sky blue
  },
  desert: {
    primary: '#CD853F',   // Peru
    secondary: '#DEB887', // Burlywood
    accent: '#FF4500',    // Orange red
    bg: '#FFE4B5'         // Moccasin
  },
  snow: {
    primary: '#00CED1',   // Dark turquoise
    secondary: '#B0C4DE', // Light steel blue
    accent: '#FF1493',    // Deep pink
    bg: '#F0F8FF'         // Alice blue
  },
  candy: {
    primary: '#FF69B4',   // Hot pink
    secondary: '#DA70D6', // Orchid
    accent: '#00FF7F',    // Spring green
    bg: '#FFE4E1'         // Misty rose
  },
  farm: {
    primary: '#8B4513',   // Saddle brown
    secondary: '#228B22', // Forest green
    accent: '#FFD700',    // Gold
    bg: '#87CEEB'         // Sky blue
  },
  castle: {
    primary: '#800080',   // Purple
    secondary: '#A0522D', // Sienna
    accent: '#FFD700',    // Gold
    bg: '#D3D3D3'         // Light gray
  },
  underwater: {
    primary: '#008B8B',   // Dark cyan
    secondary: '#20B2AA', // Light sea green
    accent: '#FF7F50',    // Coral
    bg: '#00CED1'         // Dark turquoise
  },
  custom: {
    primary: '#4F46E5',   // Indigo
    secondary: '#7C3AED', // Violet
    accent: '#F59E0B',    // Amber
    bg: '#EF4444'         // Red
  }
}

// Get theme-appropriate defaults
export function getThemeDefaults(theme: GameTheme): Partial<GameSpec> {
  return {
    palette: THEME_PALETTES[theme],
    effects: {
      particles: getThemeParticles(theme),
      filters: getThemeFilters(theme),
      weather: getThemeWeather(theme)
    }
  }
}

function getThemeParticles(theme: GameTheme): string[] {
  switch (theme) {
    case 'forest': return ['leafBurst', 'sparkle', 'dustMotes']
    case 'ocean': return ['bubbles', 'splash', 'sparkle']
    case 'space': return ['starDust', 'nebula', 'sparkle']
    case 'snow': return ['snowflakes', 'iceSparkle', 'frost']
    case 'candy': return ['confetti', 'hearts', 'sparkle']
    case 'underwater': return ['bubbles', 'seaweed', 'fishSwim']
    default: return ['sparkle', 'dustMotes']
  }
}

function getThemeFilters(theme: GameTheme): string[] {
  switch (theme) {
    case 'space': return ['bloom', 'starfield']
    case 'underwater': return ['underwater', 'caustics']
    case 'candy': return ['bloom', 'colorMatrix']
    case 'snow': return ['frost', 'blur']
    default: return ['bloom']
  }
}

function getThemeWeather(theme: GameTheme): Effects['weather'] {
  switch (theme) {
    case 'forest': return 'floating-leaves'
    case 'snow': return 'snow'
    case 'ocean': case 'underwater': return 'bubbles'
    default: return 'none'
  }
}

// NEW: Template Defaults for consistent game structure
export const TEMPLATE_DEFAULTS: Record<GameTemplate, Partial<GameSpec>> = {
  platformer: {
    template: 'platformer',
    camera: {
      type: 'side',
      parallaxLayers: 3
    },
    player: {
      speed: 150,
      abilities: ['jump'],
      hitbox: { w: 32, h: 32 },
      idleAnim: 'idle',
      runAnim: 'run',
      jumpAnim: 'jump'
    },
    level: {
      segments: 4,
      length: 1200,
      platforms: 'auto',
      obstacles: [],
      goal: 'collect-N',
      goalValue: 10
    },
    winCondition: 'collect-all',
    codingConcepts: ['loops', 'conditions', 'events'],
    ui: {
      showScore: true,
      showHealth: false,
      showTimer: false,
      tutorial: true
    }
  },
  'endless-runner': {
    template: 'endless-runner',
    camera: {
      type: 'side',
      parallaxLayers: 4
    },
    player: {
      speed: 200,
      abilities: ['jump', 'dash'],
      hitbox: { w: 28, h: 28 },
      idleAnim: 'idle',
      runAnim: 'run',
      jumpAnim: 'jump'
    },
    level: {
      segments: 8,
      length: 3200,
      platforms: 'auto',
      obstacles: [],
      goal: 'survive-time',
      goalValue: 60
    },
    winCondition: 'score-target',
    winTarget: 50,
    codingConcepts: ['loops', 'variables', 'functions'],
    ui: {
      showScore: true,
      showHealth: true,
      showTimer: true,
      tutorial: true
    }
  },
  'top-down-collector': {
    template: 'top-down-collector',
    camera: {
      type: 'top',
      parallaxLayers: 2
    },
    player: {
      speed: 120,
      abilities: [],
      hitbox: { w: 30, h: 30 },
      idleAnim: 'idle',
      runAnim: 'run',
      jumpAnim: 'jump'
    },
    level: {
      segments: 1,
      length: 800,
      platforms: 'none',
      obstacles: [],
      goal: 'collect-N',
      goalValue: 15
    },
    winCondition: 'collect-all',
    codingConcepts: ['movement', 'collision', 'scoring'],
    ui: {
      showScore: true,
      showHealth: false,
      showTimer: false,
      tutorial: true
    }
  }
}

// NEW: Theme Pack Asset Configurations
export const THEME_PACK_CONFIGS: Record<ThemePack, {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string[]
  }
  assets: {
    player: string
    collectible: string
    obstacle: string
    platform: string
  }
  sounds: {
    collect: string
    jump: string
    victory: string
    background: string
  }
  particles: string[]
}> = {
  forest: {
    colors: {
      primary: '#4A7C59',
      secondary: '#8FBC8F',
      accent: '#FFD700',
      background: ['#87CEEB', '#98FB98']
    },
    assets: {
      player: 'forest-character',
      collectible: 'acorn',
      obstacle: 'tree-trunk',
      platform: 'log'
    },
    sounds: {
      collect: 'leaf-rustle',
      jump: 'branch-snap',
      victory: 'birds-chirping',
      background: 'forest-ambience'
    },
    particles: ['leafBurst', 'sparkle', 'dustMotes']
  },
  space: {
    colors: {
      primary: '#4B0082',
      secondary: '#9370DB',
      accent: '#00FFFF',
      background: ['#000428', '#004e92']
    },
    assets: {
      player: 'astronaut',
      collectible: 'star',
      obstacle: 'asteroid',
      platform: 'space-platform'
    },
    sounds: {
      collect: 'cosmic-chime',
      jump: 'thruster',
      victory: 'space-victory',
      background: 'space-ambient'
    },
    particles: ['starDust', 'nebula', 'sparkle']
  },
  ocean: {
    colors: {
      primary: '#006994',
      secondary: '#47B5FF',
      accent: '#FFB84D',
      background: ['#0077be', '#00a8cc']
    },
    assets: {
      player: 'fish',
      collectible: 'pearl',
      obstacle: 'shark',
      platform: 'coral'
    },
    sounds: {
      collect: 'bubble-pop',
      jump: 'water-splash',
      victory: 'ocean-waves',
      background: 'underwater-ambient'
    },
    particles: ['bubbles', 'splash', 'sparkle']
  }
}

// NEW: Enhanced Validation and Repair Functions
export function validateGameSpec(spec: unknown): GameSpec | null {
  try {
    return GameSpecSchema.parse(spec)
  } catch (error) {
    console.error('GameSpec validation failed:', error)
    return null
  }
}

export function repairGameSpec(spec: Partial<GameSpec>): GameSpec {
  console.log('🔧 Repairing GameSpec...', spec)
  
  // Step 1: Determine template and theme pack
  const template = spec.template || getTemplateByComplexity(spec.ageGroup || '7-9', spec.difficulty || 'medium')
  const themePack = spec.themePack || getThemePackByPrompt(spec.title || spec.description || '')
  
  // Step 2: Apply template defaults
  const templateDefaults = TEMPLATE_DEFAULTS[template]
  const themeConfig = THEME_PACK_CONFIGS[themePack]
  
  // Step 3: Build repaired spec
  const repairedSpec: GameSpec = {
    // Basic Info
    title: spec.title || 'My Awesome Game',
    description: spec.description || 'A fun game created with Zamboo!',
    ageGroup: spec.ageGroup || '7-9',
    difficulty: spec.difficulty || 'medium',
    
    // Core Architecture
    template,
    themePack,
    
    // Legacy compatibility - map from theme pack
    theme: themePack as any,
    camera: { ...templateDefaults.camera, ...spec.camera } as any,
    palette: {
      primary: themeConfig.colors.primary,
      secondary: themeConfig.colors.secondary,
      accent: themeConfig.colors.accent,
      bg: themeConfig.colors.background[0]
    },
    
    // Game Components
    player: { 
      ...templateDefaults.player, 
      ...spec.player,
      sprite: spec.player?.sprite || themeConfig.assets.player
    } as any,
    enemies: spec.enemies || [],
    collectibles: spec.collectibles || [{
      name: 'treasure',
      sprite: themeConfig.assets.collectible,
      value: 10,
      particle: 'sparkle'
    }],
    level: { ...templateDefaults.level, ...spec.level } as any,
    effects: {
      particles: themeConfig.particles,
      filters: ['bloom'],
      weather: getThemeWeather(themePack as any)
    },
    audio: {
      music: themeConfig.sounds.background,
      sfx: {
        jump: themeConfig.sounds.jump,
        collect: themeConfig.sounds.collect,
        victory: themeConfig.sounds.victory,
        hurt: 'hurt1'
      }
    },
    controls: {
      keyboard: true,
      touch: true,
      gamepad: false
    },
    ui: { ...templateDefaults.ui, ...spec.ui } as any,
    
    // Educational
    codingConcepts: spec.codingConcepts || templateDefaults.codingConcepts || ['loops'],
    learningObjectives: spec.learningObjectives || ['Learn game mechanics'],
    
    // Win Conditions
    winCondition: spec.winCondition || templateDefaults.winCondition || 'collect-all',
    winTarget: spec.winTarget || templateDefaults.winTarget || 10,
    
    // Zamboo Messages
    zambooMessages: spec.zambooMessages || generateZambooMessages(spec.title || 'My Game', template),
    
    // Metadata
    createdBy: spec.createdBy || 'zamboo-ai',
    createdAt: spec.createdAt || new Date().toISOString(),
    version: spec.version || '1.0.0'
  }
  
  // Step 4: Final validation
  try {
    return GameSpecSchema.parse(repairedSpec)
  } catch (error) {
    console.error('❌ Repaired spec still invalid, using safe defaults:', error)
    return createDefaultGameSpec()
  }
}

export function createDefaultGameSpec(): GameSpec {
  return repairGameSpec({
    title: 'Star Collector Adventure',
    description: 'Collect all the stars in this magical forest adventure!',
    ageGroup: '7-9',
    difficulty: 'medium',
    template: 'platformer',
    themePack: 'forest'
  })
}

// NEW: Utility Functions for AI Integration
export function getTemplateByComplexity(ageGroup: string, difficulty: string): GameTemplate {
  if (ageGroup === '4-6' || difficulty === 'easy') {
    return 'top-down-collector'
  } else if (difficulty === 'hard' || ageGroup === '10-12') {
    return 'endless-runner'
  }
  return 'platformer'
}

export function getThemePackByPrompt(prompt: string): ThemePack {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('space') || lowerPrompt.includes('star') || lowerPrompt.includes('rocket') || lowerPrompt.includes('alien')) {
    return 'space'
  } else if (lowerPrompt.includes('ocean') || lowerPrompt.includes('fish') || lowerPrompt.includes('water') || lowerPrompt.includes('sea') || lowerPrompt.includes('underwater')) {
    return 'ocean'
  }
  return 'forest'
}

export function generateZambooMessages(title: string, template: GameTemplate): GameSpec['zambooMessages'] {
  const templates = {
    platformer: {
      welcome: `Welcome to ${title}! Jump on platforms and explore this awesome world!`,
      encouragement: 'Nice jumping! You\'re getting the hang of it!',
      victory: 'Incredible! You mastered the platforming challenge! 🏆',
      instructions: 'Use arrow keys to move left and right, spacebar to jump!'
    },
    'endless-runner': {
      welcome: `Ready for ${title}? Run as far as you can and collect everything!`,
      encouragement: 'Amazing reflexes! Keep running and collecting!',
      victory: 'Wow! You achieved an incredible score! 🚀',
      instructions: 'Use spacebar to jump over obstacles and collect items!'
    },
    'top-down-collector': {
      welcome: `Welcome to ${title}! Move around and collect all the treasures!`,
      encouragement: 'Great collecting! You\'re doing fantastic!',
      victory: 'Perfect! You found all the treasures! 💎',
      instructions: 'Use arrow keys or WASD to move around!'
    }
  }
  
  return templates[template]
}

// NEW: Type Guards for Template System
export function isValidGameSpec(spec: unknown): spec is GameSpec {
  return validateGameSpec(spec) !== null
}

export function isGameTemplate(value: string): value is GameTemplate {
  return ['platformer', 'endless-runner', 'top-down-collector'].includes(value)
}

export function isThemePack(value: string): value is ThemePack {
  return ['forest', 'space', 'ocean'].includes(value)
}