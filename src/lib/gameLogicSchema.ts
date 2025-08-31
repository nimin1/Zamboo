import { z } from 'zod'

// Basic types
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number()
})

export const VelocitySchema = z.object({
  x: z.number(),
  y: z.number()
})

export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive()
})

export const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/).or(
  z.enum(['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'white', 'black'])
)

// Sprite/Asset types
export const SpriteSchema = z.object({
  type: z.enum(['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'panda', 'bamboo', 'rocket', 'gem']),
  color: ColorSchema,
  size: SizeSchema.optional(),
  image: z.string().optional() // For custom sprites
})

// Physics and movement
export const PhysicsSchema = z.object({
  gravity: z.number().default(0),
  friction: z.number().min(0).max(1).default(0.99),
  bounce: z.number().min(0).max(1).default(0),
  mass: z.number().positive().default(1)
})

// Animation types
export const AnimationSchema = z.object({
  type: z.enum(['bounce', 'spin', 'float', 'pulse', 'wiggle', 'grow', 'fade']),
  duration: z.number().positive().default(1000),
  repeat: z.boolean().default(true),
  easing: z.enum(['linear', 'ease', 'ease-in', 'ease-out', 'bounce']).default('ease')
})

// Particles and effects
export const ParticleEffectSchema = z.object({
  type: z.enum(['stars', 'sparkles', 'confetti', 'bubbles', 'leaves', 'snow']),
  count: z.number().min(1).max(100).default(10),
  color: ColorSchema.optional(),
  duration: z.number().positive().default(2000),
  spread: z.number().positive().default(50)
})

// Background types
export const BackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'parallax', 'starfield', 'bamboo', 'space']),
  colors: z.array(ColorSchema).min(1),
  scrollSpeed: z.number().optional(), // For parallax
  layers: z.array(z.string()).optional() // For complex backgrounds
})

// Game object (entities in the game)
export const GameObjectSchema = z.object({
  id: z.string(),
  type: z.enum(['player', 'collectible', 'obstacle', 'enemy', 'platform', 'goal', 'decoration']),
  sprite: SpriteSchema,
  position: PositionSchema,
  velocity: VelocitySchema.optional(),
  size: SizeSchema,
  physics: PhysicsSchema.optional(),
  animation: AnimationSchema.optional(),
  health: z.number().positive().optional(),
  points: z.number().optional(), // Points awarded for interaction
  collidable: z.boolean().default(true),
  visible: z.boolean().default(true),
  metadata: z.record(z.any()).optional() // Extra properties for specific behaviors
})

// Event types
export const GameEventSchema = z.object({
  id: z.string(),
  trigger: z.enum(['collision', 'timer', 'keypress', 'click', 'gamestart', 'gameend', 'score']),
  condition: z.object({
    objectId: z.string().optional(),
    key: z.string().optional(), // For keypress events
    value: z.number().optional(), // For score/timer conditions
    operator: z.enum(['equals', 'greater', 'less', 'contains']).optional()
  }).optional(),
  actions: z.array(z.object({
    type: z.enum(['move', 'destroy', 'spawn', 'score', 'sound', 'effect', 'win', 'lose', 'message']),
    targetId: z.string().optional(),
    value: z.union([z.string(), z.number(), PositionSchema]).optional(),
    duration: z.number().optional()
  }))
})

// Game rules and win conditions
export const WinConditionSchema = z.object({
  type: z.enum(['collect_all', 'score_target', 'time_limit', 'reach_goal', 'survive']),
  target: z.number().optional(), // For score targets or item counts
  timeLimit: z.number().optional() // In seconds
})

export const GameRulesSchema = z.object({
  winConditions: z.array(WinConditionSchema),
  loseConditions: z.array(WinConditionSchema).optional(),
  scoring: z.object({
    enabled: z.boolean().default(true),
    multiplier: z.number().positive().default(1)
  }).optional(),
  timer: z.object({
    enabled: z.boolean().default(false),
    duration: z.number().positive().optional()
  }).optional(),
  lives: z.number().positive().optional()
})

// Control scheme
export const ControlsSchema = z.object({
  type: z.enum(['arrows', 'wasd', 'mouse', 'touch', 'auto']),
  mouseEnabled: z.boolean().default(true),
  touchEnabled: z.boolean().default(true),
  customKeys: z.record(z.string()).optional()
})

// Educational concepts that this game teaches
export const ConceptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum(['loops', 'conditions', 'events', 'variables', 'functions', 'logic'])
})

// Main GameLogic schema
export const GameLogicSchema = z.object({
  // Basic game info
  id: z.string(),
  title: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ageGroup: z.enum(['5-7', '8-10', '11-13', '14+']),
  
  // Game world
  worldSize: SizeSchema,
  background: BackgroundSchema,
  camera: z.object({
    followPlayer: z.boolean().default(true),
    bounds: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }).optional()
  }).optional(),
  
  // Game elements
  objects: z.array(GameObjectSchema),
  events: z.array(GameEventSchema),
  effects: z.array(ParticleEffectSchema).optional(),
  
  // Game mechanics
  rules: GameRulesSchema,
  controls: ControlsSchema,
  physics: PhysicsSchema.optional(),
  
  // Educational content
  concepts: z.array(ConceptSchema),
  hints: z.array(z.string()).optional(),
  
  // Zamboo personality
  zambooDialogue: z.object({
    welcome: z.string(),
    instructions: z.string(),
    encouragement: z.array(z.string()),
    victory: z.string(),
    defeat: z.string(),
    hints: z.array(z.string()).optional()
  }),
  
  // Metadata
  createdBy: z.enum(['ai', 'template', 'user']),
  template: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // Version for schema evolution
  version: z.string().default('1.0')
})

// Export types
export type Position = z.infer<typeof PositionSchema>
export type Velocity = z.infer<typeof VelocitySchema>
export type Size = z.infer<typeof SizeSchema>
export type Color = z.infer<typeof ColorSchema>
export type Sprite = z.infer<typeof SpriteSchema>
export type Physics = z.infer<typeof PhysicsSchema>
export type Animation = z.infer<typeof AnimationSchema>
export type ParticleEffect = z.infer<typeof ParticleEffectSchema>
export type Background = z.infer<typeof BackgroundSchema>
export type GameObject = z.infer<typeof GameObjectSchema>
export type GameEvent = z.infer<typeof GameEventSchema>
export type WinCondition = z.infer<typeof WinConditionSchema>
export type GameRules = z.infer<typeof GameRulesSchema>
export type Controls = z.infer<typeof ControlsSchema>
export type Concept = z.infer<typeof ConceptSchema>
export type GameLogic = z.infer<typeof GameLogicSchema>

// Validation helpers
export const validateGameLogic = (data: unknown): GameLogic => {
  return GameLogicSchema.parse(data)
}

export const isValidGameLogic = (data: unknown): data is GameLogic => {
  try {
    GameLogicSchema.parse(data)
    return true
  } catch {
    return false
  }
}

// Template helpers for common game patterns
export const createCollectorTemplate = (title: string, collectibleType: Sprite['type']): Partial<GameLogic> => ({
  title,
  difficulty: 'easy',
  ageGroup: '5-7',
  concepts: [
    {
      id: 'loops',
      name: 'Loops',
      description: 'Repeating actions over and over, like collecting items!',
      examples: ['Collect all the stars', 'Pick up every gem'],
      difficulty: 'beginner',
      category: 'loops'
    }
  ],
  zambooDialogue: {
    welcome: `Hi there! I'm Zamboo! 🐼 Let's collect all the ${collectibleType}s together!`,
    instructions: `Use arrow keys to move around and collect all the ${collectibleType}s!`,
    encouragement: [
      "You're doing great! Keep going!",
      "Wow! Look at you go!",
      "Almost there! Don't give up!"
    ],
    victory: "Fantastic! You collected them all! You're a coding superstar! 🌟",
    defeat: "Oops! That's okay - let's try again! Practice makes perfect! 💪"
  }
})

export const createMazeTemplate = (title: string): Partial<GameLogic> => ({
  title,
  difficulty: 'medium',
  ageGroup: '8-10',
  concepts: [
    {
      id: 'conditions',
      name: 'Conditions',
      description: 'Making decisions: IF this THEN that!',
      examples: ['If I hit a wall, then I stop', 'If I reach the exit, then I win'],
      difficulty: 'beginner',
      category: 'conditions'
    }
  ],
  zambooDialogue: {
    welcome: `Welcome to the bamboo maze! I'm Zamboo, and I'll help you navigate through! 🐼🎋`,
    instructions: "Use arrow keys to move through the maze. Find the exit without hitting too many walls!",
    encouragement: [
      "Think before you move!",
      "Oops! Try a different path!",
      "You're learning the maze pattern!"
    ],
    victory: "Amazing! You found the way out! You're a maze master! 🏆",
    defeat: "Don't worry! Mazes are tricky. Let's try again and think about the path! 🤔"
  }
})