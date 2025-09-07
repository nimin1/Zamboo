// Pre-built Game Templates for Zamboo
// These templates provide consistent, high-quality game structures that the AI can customize

import type { GameSpec, GameTemplate, ThemePack } from '@/types/gamespec'
import { THEME_PACK_CONFIGS, generateZambooMessages } from '@/types/gamespec'

// Base template configurations
export interface GameTemplateConfig {
  id: string
  name: string
  description: string
  recommendedAges: string[]
  concepts: string[]
  baseSpec: Partial<GameSpec>
}

// 🎯 TEMPLATE 1: PLATFORMER
export const PLATFORMER_TEMPLATE: GameTemplateConfig = {
  id: 'platformer',
  name: 'Platform Adventure',
  description: 'Jump on platforms, collect items, and reach the goal',
  recommendedAges: ['7-9', '10-12'],
  concepts: ['loops', 'conditions', 'events', 'physics'],
  baseSpec: {
    template: 'platformer',
    difficulty: 'medium',
    winCondition: 'collect-all',
    winTarget: 8,
    codingConcepts: ['loops', 'conditions', 'events'],
    learningObjectives: [
      'Learn how game loops control movement',
      'Understand collision detection',
      'Explore gravity and jumping mechanics'
    ]
  }
}

// 🚀 TEMPLATE 2: ENDLESS RUNNER
export const ENDLESS_RUNNER_TEMPLATE: GameTemplateConfig = {
  id: 'endless-runner',
  name: 'Endless Adventure',
  description: 'Run continuously, avoid obstacles, and collect power-ups',
  recommendedAges: ['8-10', '10-12'],
  concepts: ['loops', 'variables', 'functions', 'timing'],
  baseSpec: {
    template: 'endless-runner',
    difficulty: 'medium',
    winCondition: 'score-target',
    winTarget: 100,
    codingConcepts: ['loops', 'variables', 'functions'],
    learningObjectives: [
      'Understand infinite game loops',
      'Learn about scoring systems',
      'Explore procedural generation'
    ]
  }
}

// 🎯 TEMPLATE 3: TOP-DOWN COLLECTOR
export const TOP_DOWN_COLLECTOR_TEMPLATE: GameTemplateConfig = {
  id: 'top-down-collector',
  name: 'Treasure Hunt',
  description: 'Move in all directions to collect treasures and avoid dangers',
  recommendedAges: ['4-6', '7-9'],
  concepts: ['movement', 'collision', 'scoring', 'counting'],
  baseSpec: {
    template: 'top-down-collector',
    difficulty: 'easy',
    winCondition: 'collect-all',
    winTarget: 6,
    codingConcepts: ['movement', 'collision', 'scoring'],
    learningObjectives: [
      'Learn basic movement controls',
      'Understand object collection',
      'Practice counting and goals'
    ]
  }
}

// Template registry
export const GAME_TEMPLATES: Record<GameTemplate, GameTemplateConfig> = {
  'platformer': PLATFORMER_TEMPLATE,
  'endless-runner': ENDLESS_RUNNER_TEMPLATE,
  'top-down-collector': TOP_DOWN_COLLECTOR_TEMPLATE
}

// 🎨 Theme-specific customizations
export function customizeTemplateForTheme(
  template: GameTemplateConfig,
  themePack: ThemePack,
  customization: {
    title?: string
    description?: string
    playerName?: string
    collectibleName?: string
  } = {}
): Partial<GameSpec> {
  const themeConfig = THEME_PACK_CONFIGS[themePack]
  
  // Generate theme-appropriate title and description
  const title = customization.title || generateThemeTitle(template, themePack)
  const description = customization.description || generateThemeDescription(template, themePack)
  
  // Generate Zamboo messages for this specific game
  const zambooMessages = generateZambooMessages(title, template.id as GameTemplate)
  
  return {
    ...template.baseSpec,
    title,
    description,
    themePack,
    zambooMessages,
    // Theme-specific adjustments
    ...(themePack === 'ocean' && template.id === 'platformer' && {
      winTarget: template.baseSpec.winTarget! + 2, // Ocean games have more collectibles
      learningObjectives: [
        ...template.baseSpec.learningObjectives!,
        'Explore underwater physics'
      ]
    }),
    ...(themePack === 'space' && template.id === 'endless-runner' && {
      winTarget: template.baseSpec.winTarget! + 50, // Space games have higher scores
      codingConcepts: [...template.baseSpec.codingConcepts!, 'arrays']
    })
  }
}

// 🏗️ Template Builders - Create complete GameSpecs
export function buildPlatformerGame(themePack: ThemePack, customization?: {
  title?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  collectibleCount?: number
}): Partial<GameSpec> {
  const template = PLATFORMER_TEMPLATE
  const themeCustomization = customizeTemplateForTheme(template, themePack, {
    title: customization?.title
  })
  
  return {
    ...themeCustomization,
    difficulty: customization?.difficulty || 'medium',
    winTarget: customization?.collectibleCount || 8,
    ageGroup: customization?.difficulty === 'easy' ? '7-9' : '8-10'
  }
}

export function buildEndlessRunnerGame(themePack: ThemePack, customization?: {
  title?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  scoreTarget?: number
}): Partial<GameSpec> {
  const template = ENDLESS_RUNNER_TEMPLATE
  const themeCustomization = customizeTemplateForTheme(template, themePack, {
    title: customization?.title
  })
  
  return {
    ...themeCustomization,
    difficulty: customization?.difficulty || 'medium',
    winTarget: customization?.scoreTarget || 100,
    ageGroup: customization?.difficulty === 'easy' ? '8-10' : '10-12'
  }
}

export function buildCollectorGame(themePack: ThemePack, customization?: {
  title?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  collectibleCount?: number
}): Partial<GameSpec> {
  const template = TOP_DOWN_COLLECTOR_TEMPLATE
  const themeCustomization = customizeTemplateForTheme(template, themePack, {
    title: customization?.title
  })
  
  return {
    ...themeCustomization,
    difficulty: customization?.difficulty || 'easy',
    winTarget: customization?.collectibleCount || 6,
    ageGroup: customization?.difficulty === 'hard' ? '7-9' : '4-6'
  }
}

// 🎨 Theme-aware title and description generators
function generateThemeTitle(template: GameTemplateConfig, themePack: ThemePack): string {
  const themeWords = {
    forest: {
      adjectives: ['Magical', 'Enchanted', 'Mystical', 'Forest'],
      nouns: ['Adventure', 'Quest', 'Journey', 'Explorer']
    },
    space: {
      adjectives: ['Cosmic', 'Stellar', 'Galactic', 'Space'],
      nouns: ['Explorer', 'Adventure', 'Mission', 'Journey']
    },
    ocean: {
      adjectives: ['Deep', 'Underwater', 'Ocean', 'Aquatic'],
      nouns: ['Adventure', 'Explorer', 'Quest', 'Journey']
    }
  }
  
  const words = themeWords[themePack]
  const adjective = words.adjectives[Math.floor(Math.random() * words.adjectives.length)]
  const noun = words.nouns[Math.floor(Math.random() * words.nouns.length)]
  
  if (template.id === 'platformer') {
    return `${adjective} Platform ${noun}`
  } else if (template.id === 'endless-runner') {
    return `${adjective} Runner ${noun}`
  } else {
    return `${adjective} Treasure ${noun}`
  }
}

function generateThemeDescription(template: GameTemplateConfig, themePack: ThemePack): string {
  const themeContext = {
    forest: 'magical forest filled with ancient trees and friendly creatures',
    space: 'vast cosmos with twinkling stars and distant planets',
    ocean: 'deep blue ocean with colorful coral reefs and sea life'
  }
  
  const context = themeContext[themePack]
  
  if (template.id === 'platformer') {
    return `Jump through platforms in a ${context} and collect treasures!`
  } else if (template.id === 'endless-runner') {
    return `Run endlessly through a ${context} while collecting points and avoiding obstacles!`
  } else {
    return `Explore a ${context} and collect all the hidden treasures!`
  }
}

// 🎯 Smart Template Selection
export function selectBestTemplate(
  prompt: string,
  ageGroup: string,
  difficulty: string
): GameTemplate {
  const lowerPrompt = prompt.toLowerCase()
  
  // Age-based template selection
  if (ageGroup === '4-6') {
    return 'top-down-collector' // Simplest for youngest kids
  }
  
  // Keyword-based template selection
  if (lowerPrompt.includes('jump') || lowerPrompt.includes('platform') || lowerPrompt.includes('climb')) {
    return 'platformer'
  }
  
  if (lowerPrompt.includes('run') || lowerPrompt.includes('race') || lowerPrompt.includes('endless') || lowerPrompt.includes('fast')) {
    return 'endless-runner'
  }
  
  if (lowerPrompt.includes('collect') || lowerPrompt.includes('find') || lowerPrompt.includes('treasure') || lowerPrompt.includes('hunt')) {
    return 'top-down-collector'
  }
  
  // Difficulty-based fallback
  if (difficulty === 'easy') {
    return 'top-down-collector'
  } else if (difficulty === 'hard') {
    return 'endless-runner'
  }
  
  // Default to platformer (most versatile)
  return 'platformer'
}

// 🏗️ Template Assembly Functions
export function assembleGameFromTemplate(
  template: GameTemplate,
  themePack: ThemePack,
  customization: {
    title?: string
    description?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    ageGroup?: '4-6' | '7-9' | '10-12'
    winTarget?: number
  } = {}
): Partial<GameSpec> {
  switch (template) {
    case 'platformer':
      return buildPlatformerGame(themePack, {
        title: customization.title,
        difficulty: customization.difficulty,
        collectibleCount: customization.winTarget
      })
    
    case 'endless-runner':
      return buildEndlessRunnerGame(themePack, {
        title: customization.title,
        difficulty: customization.difficulty,
        scoreTarget: customization.winTarget
      })
    
    case 'top-down-collector':
      return buildCollectorGame(themePack, {
        title: customization.title,
        difficulty: customization.difficulty,
        collectibleCount: customization.winTarget
      })
    
    default:
      return buildPlatformerGame(themePack, customization)
  }
}

// 📊 Template Analytics and Quality Metrics
export interface TemplateQualityMetrics {
  educationalValue: number // 1-10
  funFactor: number // 1-10
  ageAppropriate: number // 1-10
  technicalQuality: number // 1-10
  replayability: number // 1-10
  overallScore: number // 1-10
}

export function evaluateTemplateQuality(template: GameTemplate, themePack: ThemePack): TemplateQualityMetrics {
  // Base scores for each template type
  const baseScores = {
    'platformer': { educational: 8, fun: 9, age: 8, technical: 9, replay: 7 },
    'endless-runner': { educational: 7, fun: 9, age: 7, technical: 8, replay: 9 },
    'top-down-collector': { educational: 9, fun: 8, age: 10, technical: 7, replay: 6 }
  }
  
  // Theme bonuses
  const themeBonuses = {
    'forest': { educational: 1, fun: 0, age: 1, technical: 0, replay: 0 },
    'space': { educational: 0, fun: 1, age: 0, technical: 1, replay: 1 },
    'ocean': { educational: 1, fun: 1, age: 1, technical: 0, replay: 0 }
  }
  
  const base = baseScores[template]
  const bonus = themeBonuses[themePack]
  
  const metrics = {
    educationalValue: Math.min(10, base.educational + bonus.educational),
    funFactor: Math.min(10, base.fun + bonus.fun),
    ageAppropriate: Math.min(10, base.age + bonus.age),
    technicalQuality: Math.min(10, base.technical + bonus.technical),
    replayability: Math.min(10, base.replay + bonus.replay),
    overallScore: 0
  }
  
  // Calculate overall score as weighted average
  metrics.overallScore = Math.round(
    (metrics.educationalValue * 0.25 + 
     metrics.funFactor * 0.25 + 
     metrics.ageAppropriate * 0.2 + 
     metrics.technicalQuality * 0.15 + 
     metrics.replayability * 0.15) * 10
  ) / 10
  
  return metrics
}

// 🎯 Export all template functions
export {
  GAME_TEMPLATES,
  customizeTemplateForTheme,
  buildPlatformerGame,
  buildEndlessRunnerGame,
  buildCollectorGame,
  selectBestTemplate,
  assembleGameFromTemplate,
  evaluateTemplateQuality
}