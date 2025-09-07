import { z } from "zod";

// Basic types
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const VelocitySchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
});

export const ColorSchema = z.string().min(1); // Allow any creative color strings for AI

// Sprite/Asset types
export const SpriteSchema = z.object({
  type: z.string(), // Allow any creative sprite type the AI generates
  color: ColorSchema,
  colors: z.array(ColorSchema).optional(), // For gradients and multiple colors
  glow: z.boolean().optional(), // For glowing effects
  glowColor: ColorSchema.optional(), // Glow color
  glowIntensity: z.number().min(0).max(1).optional(), // Glow strength
  size: SizeSchema.optional(),
  image: z.string().optional(), // For custom sprites
  // Advanced visual properties
  opacity: z.number().min(0).max(1).optional(),
  rotation: z.number().optional(),
  scale: z.number().positive().optional(),
  tint: ColorSchema.optional(),
  blend: z.enum(["normal", "add", "multiply", "screen", "overlay"]).optional(),
  // Material properties
  material: z.string().optional(), // Allow any creative material the AI generates
  // Particle trails
  trail: z
    .object({
      enabled: z.boolean(),
      color: ColorSchema.optional(),
      length: z.number().positive().optional(),
      width: z.number().positive().optional(),
    })
    .optional(),
});

// Physics and movement
export const PhysicsSchema = z.object({
  gravity: z.number().default(0),
  friction: z.number().min(0).max(1).default(0.99),
  bounce: z.number().min(0).max(1).default(0),
  mass: z.number().positive().default(1),
});

// Animation types
export const AnimationSchema = z.object({
  type: z.enum([
    // Basic animations
    "bounce",
    "spin",
    "float",
    "pulse",
    "wiggle",
    "grow",
    "fade",
    // Advanced animations
    "breathe",
    "glow",
    "sparkle",
    "shimmer",
    "ripple",
    "wave",
    "orbit",
    "spiral",
    "zoom",
    "shake",
    "swing",
    "elastic",
    "magnetic",
    "plasma",
    // Compound animations
    "float-spin",
    "pulse-glow",
    "bounce-sparkle",
    "wiggle-fade",
    "grow-glow",
  ]),
  duration: z.number().positive().default(1000),
  repeat: z.boolean().default(true),
  easing: z
    .enum([
      "linear",
      "ease",
      "ease-in",
      "ease-out",
      "bounce",
      "elastic",
      "back",
    ])
    .default("ease"),
  // Advanced animation properties
  intensity: z.number().min(0).max(1).optional(),
  speed: z.number().positive().optional(),
  direction: z.enum(["normal", "reverse", "alternate"]).optional(),
  delay: z.number().optional(),
  // Particle animation
  particleCount: z.number().positive().optional(),
  particleLifetime: z.number().positive().optional(),
});

// Particles and effects
export const ParticleEffectSchema = z.object({
  type: z.enum(["stars", "sparkles", "confetti", "bubbles", "leaves", "snow"]),
  count: z.number().min(1).max(100).default(10),
  color: ColorSchema.optional(),
  duration: z.number().positive().default(2000),
  spread: z.number().positive().default(50),
});

// Background types
export const BackgroundSchema = z.object({
  type: z.string(), // Allow any creative background type the AI generates
  colors: z.array(ColorSchema).min(1),
  scrollSpeed: z.number().optional(), // For parallax
  layers: z
    .array(
      z.union([
        z.string(), // Simple layer names
        z.object({
          // Complex layer objects
          speed: z.number().optional(),
          type: z.string().optional(),
          colors: z.array(ColorSchema).optional(),
          opacity: z.number().min(0).max(1).optional(),
          direction: z.string().optional(),
          // Advanced layer properties
          parallaxFactor: z.number().optional(),
          particleCount: z.number().positive().optional(),
          animationSpeed: z.number().positive().optional(),
          glow: z.boolean().optional(),
          blur: z.number().min(0).optional(),
        }),
      ])
    )
    .optional(), // For complex backgrounds
  // Advanced background effects
  effects: z.array(z.string()).optional(), // Allow any creative effects the AI generates
  // Lighting
  lighting: z
    .object({
      ambient: ColorSchema.optional(),
      directional: z
        .object({
          color: ColorSchema,
          intensity: z.number().min(0).max(1),
          angle: z.number(),
        })
        .optional(),
      glow: z.boolean().optional(),
    })
    .optional(),
});

// Game object (entities in the game) - COMPLETELY FLEXIBLE
export const GameObjectSchema = z
  .object({
    id: z.string(),
    type: z.string(), // Allow ANY game object type the AI creates
    sprite: z.any(), // Allow ANY sprite configuration
    position: PositionSchema,
    velocity: VelocitySchema.optional(),
    size: SizeSchema,
    // UNLIMITED FLEXIBILITY - AI can add any properties it needs
  })
  .catchall(z.any()); // Allow unlimited additional properties for maximum creativity

// Event types - COMPLETELY DYNAMIC
export const GameEventSchema = z
  .object({
    id: z.string(),
    trigger: z.string(), // Allow any creative trigger the AI generates
    // UNLIMITED FLEXIBILITY for conditions and actions
  })
  .catchall(z.any()); // Allow AI to define any event structure it needs

// Game rules and win conditions - UNLIMITED CREATIVITY
export const WinConditionSchema = z
  .object({
    type: z.string(), // Allow any creative win condition type the AI generates
  })
  .catchall(z.any()); // Allow AI to define any win condition structure

export const GameRulesSchema = z
  .object({
    winConditions: z.array(WinConditionSchema),
    // UNLIMITED FLEXIBILITY for game rules
  })
  .catchall(z.any()); // Allow AI to define any rule system it creates

// Control scheme - DYNAMIC
export const ControlsSchema = z
  .object({
    type: z.string(), // Allow any control scheme the AI creates
  })
  .catchall(z.any()); // Allow AI to define any control system

// Educational concepts that this game teaches
export const ConceptSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  examples: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.enum([
    "loops",
    "conditions",
    "events",
    "variables",
    "functions",
    "logic",
    "physics",
    "graphics",
    "animation",
    "effects",
  ]),
});

// Main GameLogic schema - MAXIMUM FLEXIBILITY FOR AI CREATIVITY
export const GameLogicSchema = z
  .object({
    // Essential core structure - ONLY what's absolutely required
    id: z.string(),
    title: z.string().min(1),
    description: z.string().min(1),
    difficulty: z.string(), // Allow any difficulty the AI creates
    ageGroup: z.string(), // Allow any age group format

    // Basic game world - flexible structure
    worldSize: SizeSchema,
    background: z.any(), // Allow ANY background configuration

    // Core game elements - unlimited flexibility
    objects: z.array(z.any()), // Allow ANY object structure
    events: z.array(z.any()), // Allow ANY event structure
    rules: z.any(), // Allow ANY rule system
    controls: z.any(), // Allow ANY control scheme

    // Educational content - flexible
    concepts: z.array(z.any()), // Allow ANY educational concept structure

    // Zamboo personality - flexible
    zambooDialogue: z
      .object({
        welcome: z.string(),
        instructions: z.string(),
        victory: z.string(),
        defeat: z.string(),
      })
      .catchall(z.any()), // Allow additional dialogue properties

    // Metadata
    createdBy: z.string(), // Allow any creator type
    version: z.string().default("1.0"),

    // UNLIMITED ADDITIONAL PROPERTIES - AI can add ANYTHING it needs
  })
  .catchall(z.any()); // This allows the AI to add any new properties for innovative game types

// Export types
export type Position = z.infer<typeof PositionSchema>;
export type Velocity = z.infer<typeof VelocitySchema>;
export type Size = z.infer<typeof SizeSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type Sprite = z.infer<typeof SpriteSchema>;
export type Physics = z.infer<typeof PhysicsSchema>;
export type Animation = z.infer<typeof AnimationSchema>;
export type ParticleEffect = z.infer<typeof ParticleEffectSchema>;
export type Background = z.infer<typeof BackgroundSchema>;
export type GameObject = z.infer<typeof GameObjectSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;
export type WinCondition = z.infer<typeof WinConditionSchema>;
export type GameRules = z.infer<typeof GameRulesSchema>;
export type Controls = z.infer<typeof ControlsSchema>;
export type Concept = z.infer<typeof ConceptSchema>;
export type GameLogic = z.infer<typeof GameLogicSchema>;

// Validation helpers
export const validateGameLogic = (data: unknown) => {
  try {
    const validatedData = GameLogicSchema.parse(data);
    return { success: true, data: validatedData, errors: null };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      errors: error.errors || error.message || error,
    };
  }
};

// For direct parsing when you want to throw on error
export const parseGameLogic = (data: unknown): GameLogic => {
  return GameLogicSchema.parse(data);
};

export const isValidGameLogic = (data: unknown): data is GameLogic => {
  try {
    GameLogicSchema.parse(data);
    return true;
  } catch {
    return false;
  }
};

// Template helpers for common game patterns
export const createCollectorTemplate = (
  title: string,
  collectibleType: Sprite["type"]
): Partial<GameLogic> => ({
  title,
  difficulty: "easy",
  ageGroup: "5-7",
  concepts: [
    {
      id: "loops",
      name: "Loops",
      description: "Repeating actions over and over, like collecting items!",
      examples: ["Collect all the stars", "Pick up every gem"],
      difficulty: "beginner",
      category: "loops",
    },
  ],
  zambooDialogue: {
    welcome: `Hi There! I'm Zamboo! 🐼 Let's collect all the ${collectibleType}s together!`,
    instructions: `Use arrow keys to move around and collect all the ${collectibleType}s!`,
    encouragement: [
      "You're doing great! Keep going!",
      "Wow! Look at you go!",
      "Almost there! Don't give up!",
    ],
    victory: "Fantastic! You collected them all! You're a coding superstar! 🌟",
    defeat: "Oops! That's okay - let's try again! Practice makes perfect! 💪",
  },
});

export const createMazeTemplate = (title: string): Partial<GameLogic> => ({
  title,
  difficulty: "medium",
  ageGroup: "8-10",
  concepts: [
    {
      id: "conditions",
      name: "Conditions",
      description: "Making decisions: IF this THEN that!",
      examples: [
        "If I hit a wall, then I stop",
        "If I reach the exit, then I win",
      ],
      difficulty: "beginner",
      category: "conditions",
    },
  ],
  zambooDialogue: {
    welcome: `Welcome to the bamboo maze! I'm Zamboo, and I'll help you navigate through! 🐼🎋`,
    instructions:
      "Use arrow keys to move through the maze. Find the exit without hitting too many walls!",
    encouragement: [
      "Think before you move!",
      "Oops! Try a different path!",
      "You're learning the maze pattern!",
    ],
    victory: "Amazing! You found the way out! You're a maze master! 🏆",
    defeat:
      "Don't worry! Mazes are tricky. Let's try again and think about the path! 🤔",
  },
});
