// Zamboo Game Assembly Engine
// Assembles high-quality games from GameSpecs using templates and asset packs

import type { GameSpec, GameLogic, GameTemplate, ThemePack } from '@/types'
import { repairGameSpec, validateGameSpec } from '@/types/gamespec'
import { assembleGameFromTemplate, selectBestTemplate, GAME_TEMPLATES } from './gameTemplates'
import { getAssetPack, selectBestCollectible, selectBestObstacle, ASSET_PACKS } from './assetPacks'

// Main assembly function - the heart of Zamboo's new architecture
export function createZambooGame(
  prompt: string,
  ageGroup: '4-6' | '7-9' | '10-12',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): {
  gameSpec: GameSpec
  gameLogic: GameLogic
  qualityMetrics: GameQualityMetrics
  metadata: AssemblyMetadata
} {
  console.log('🎮 ZAMBOO ASSEMBLY ENGINE: Creating game...')
  console.log('📝 Input:', { prompt, ageGroup, difficulty })
  
  // Step 1: Analyze prompt and select optimal template + theme
  const template = selectBestTemplate(prompt, ageGroup, difficulty)
  const themePack = selectThemePackFromPrompt(prompt)
  
  console.log('🎯 Selected:', { template, themePack })
  
  // Step 2: Generate base GameSpec from template
  const baseSpec = assembleGameFromTemplate(template, themePack, {
    difficulty,
    ageGroup,
    title: generateSmartTitle(prompt, template, themePack),
    description: generateSmartDescription(prompt, template, themePack)
  })
  
  // Step 3: Repair and validate the GameSpec
  const repairedSpec = repairGameSpec(baseSpec)
  const validatedSpec = validateGameSpec(repairedSpec)
  
  if (!validatedSpec) {
    throw new Error('Failed to create valid GameSpec')
  }
  
  console.log('✅ GameSpec created and validated')
  
  // Step 4: Convert to legacy GameLogic for compatibility
  const gameLogic = convertSpecToGameLogic(validatedSpec)
  
  // Step 5: Calculate quality metrics
  const qualityMetrics = calculateGameQuality(validatedSpec, gameLogic)
  
  // Step 6: Generate assembly metadata
  const metadata: AssemblyMetadata = {
    assemblyTime: new Date(),
    template,
    themePack,
    prompt,
    engineVersion: '1.0.0',
    qualityScore: qualityMetrics.overallScore,
    fallbacksUsed: [],
    optimizations: getAppliedOptimizations(validatedSpec)
  }
  
  console.log('🎉 Game assembly completed!', {
    quality: qualityMetrics.overallScore,
    title: validatedSpec.title
  })
  
  return {
    gameSpec: validatedSpec,
    gameLogic,
    qualityMetrics,
    metadata
  }
}

// Smart theme selection based on prompt analysis
function selectThemePackFromPrompt(prompt: string): ThemePack {
  const lowerPrompt = prompt.toLowerCase()
  
  // Space keywords
  if (lowerPrompt.includes('space') || lowerPrompt.includes('star') || 
      lowerPrompt.includes('rocket') || lowerPrompt.includes('alien') ||
      lowerPrompt.includes('planet') || lowerPrompt.includes('galaxy') ||
      lowerPrompt.includes('astronaut') || lowerPrompt.includes('cosmic')) {
    return 'space'
  }
  
  // Ocean keywords
  if (lowerPrompt.includes('ocean') || lowerPrompt.includes('sea') || 
      lowerPrompt.includes('fish') || lowerPrompt.includes('water') ||
      lowerPrompt.includes('underwater') || lowerPrompt.includes('pearl') ||
      lowerPrompt.includes('coral') || lowerPrompt.includes('submarine')) {
    return 'ocean'
  }
  
  // Forest is default - most versatile and kid-friendly
  return 'forest'
}

// Generate contextually appropriate titles
function generateSmartTitle(prompt: string, template: GameTemplate, themePack: ThemePack): string {
  const promptWords = prompt.toLowerCase().split(' ').filter(w => w.length > 2)
  const themeAdjectives = {
    forest: ['Magical', 'Enchanted', 'Mystical', 'Wild'],
    space: ['Cosmic', 'Stellar', 'Galactic', 'Infinite'],
    ocean: ['Deep', 'Aquatic', 'Mystic', 'Pearl']
  }
  
  const templateNouns = {
    'platformer': ['Adventure', 'Quest', 'Journey', 'Explorer'],
    'endless-runner': ['Runner', 'Chase', 'Sprint', 'Rush'],
    'top-down-collector': ['Hunter', 'Collector', 'Seeker', 'Gatherer']
  }
  
  // Try to incorporate user's words
  const userNoun = promptWords.find(word => 
    ['game', 'adventure', 'quest', 'journey', 'hunt', 'race', 'run'].includes(word)
  )
  
  const adjective = themeAdjectives[themePack][Math.floor(Math.random() * themeAdjectives[themePack].length)]
  const noun = userNoun || templateNouns[template][Math.floor(Math.random() * templateNouns[template].length)]
  
  return `${adjective} ${noun}`
}

// Generate contextually appropriate descriptions
function generateSmartDescription(prompt: string, template: GameTemplate, themePack: ThemePack): string {
  const themeContexts = {
    forest: 'enchanted forest filled with magical creatures',
    space: 'vast cosmos with twinkling stars and distant worlds',
    ocean: 'mysterious underwater realm with colorful sea life'
  }
  
  const templateActions = {
    'platformer': 'Jump and explore platforms in',
    'endless-runner': 'Run endlessly through',
    'top-down-collector': 'Explore and collect treasures in'
  }
  
  const context = themeContexts[themePack]
  const action = templateActions[template]
  
  return `${action} a ${context}. Collect items and have fun!`
}

// Convert GameSpec to legacy GameLogic format
function convertSpecToGameLogic(spec: GameSpec): GameLogic {
  const assetPack = getAssetPack(spec.themePack)
  const collectible = selectBestCollectible(spec.themePack)
  const obstacle = selectBestObstacle(spec.themePack, spec.difficulty)
  
  // Generate game objects based on template and theme
  const objects: any[] = []
  
  // Player object
  objects.push({
    id: 'player',
    type: 'player',
    sprite: {
      type: 'character',
      color: assetPack.player.color,
      size: assetPack.player.size
    },
    position: getPlayerStartPosition(spec.template),
    size: assetPack.player.size
  })
  
  // Collectibles based on win target
  for (let i = 0; i < spec.winTarget; i++) {
    objects.push({
      id: `collectible_${i + 1}`,
      type: 'collectible',
      sprite: {
        type: collectible.name,
        color: collectible.color,
        size: collectible.size
      },
      position: getCollectiblePosition(i, spec.template, spec.winTarget),
      size: collectible.size,
      value: 10
    })
  }
  
  // Obstacles based on difficulty
  const obstacleCount = getObstacleCount(spec.difficulty)
  for (let i = 0; i < obstacleCount; i++) {
    objects.push({
      id: `obstacle_${i + 1}`,
      type: 'obstacle',
      sprite: {
        type: obstacle.name,
        color: obstacle.color,
        size: obstacle.size
      },
      position: getObstaclePosition(i, spec.template, obstacleCount),
      size: obstacle.size
    })
  }
  
  // Goal object (except for endless runner)
  if (spec.template !== 'endless-runner') {
    objects.push({
      id: 'goal',
      type: 'goal',
      sprite: {
        type: 'flag',
        color: assetPack.colors.accent,
        size: { width: 40, height: 50 }
      },
      position: getGoalPosition(spec.template),
      size: { width: 40, height: 50 }
    })
  }
  
  // Generate events
  const events = [
    {
      id: 'collect_item',
      trigger: 'collision' as const,
      conditions: [{ objectType: 'player' }, { objectType: 'collectible' }],
      actions: [{ type: 'collect', value: 10 }, { type: 'remove_object' }]
    }
  ]
  
  // Add win condition event
  if (spec.winCondition === 'collect-all') {
    events.push({
      id: 'win_condition',
      trigger: 'score_reached' as const,
      conditions: [{ score: spec.winTarget * 10 }],
      actions: [{ type: 'win_game' }]
    })
  } else if (spec.template !== 'endless-runner') {
    events.push({
      id: 'reach_goal',
      trigger: 'collision' as const,
      conditions: [{ objectType: 'player' }, { objectType: 'goal' }],
      actions: [{ type: 'win_game' }]
    })
  }
  
  // Generate concepts
  const concepts = spec.codingConcepts.map((concept, index) => ({
    id: `concept_${index}`,
    name: concept.charAt(0).toUpperCase() + concept.slice(1),
    description: `Learn about ${concept} in games`,
    examples: [`Use ${concept} to control game behavior`],
    difficulty: 'beginner' as const,
    category: concept as any
  }))
  
  return {
    id: `zamboo_${Date.now()}`,
    title: spec.title,
    description: spec.description,
    difficulty: spec.difficulty,
    ageGroup: spec.ageGroup,
    worldSize: { width: 800, height: 600 },
    background: {
      type: 'gradient' as const,
      colors: assetPack.colors.background
    },
    objects,
    events,
    rules: {
      winConditions: [{
        type: spec.winCondition === 'collect-all' ? 'collect_all' as const : 'reach_goal' as const
      }],
      scoring: { enabled: true }
    },
    controls: { type: 'arrows' as const },
    concepts,
    zambooDialogue: {
      welcome: spec.zambooMessages.welcome,
      instructions: spec.zambooMessages.instructions,
      encouragement: [spec.zambooMessages.encouragement],
      victory: spec.zambooMessages.victory,
      defeat: 'Try again! You can do it!'
    },
    createdBy: 'zamboo-engine' as const,
    version: '1.0'
  }
}

// Position calculation helpers
function getPlayerStartPosition(template: GameTemplate): { x: number; y: number } {
  switch (template) {
    case 'platformer':
      return { x: 50, y: 450 }
    case 'endless-runner':
      return { x: 100, y: 400 }
    case 'top-down-collector':
      return { x: 100, y: 300 }
    default:
      return { x: 50, y: 300 }
  }
}

function getCollectiblePosition(index: number, template: GameTemplate, total: number): { x: number; y: number } {
  switch (template) {
    case 'platformer':
      return {
        x: 150 + (index * 100),
        y: 400 - (index % 2) * 50
      }
    case 'endless-runner':
      return {
        x: 200 + (index * 80),
        y: 350 + (index % 3) * 30
      }
    case 'top-down-collector':
      const cols = Math.ceil(Math.sqrt(total))
      return {
        x: 200 + (index % cols) * 120,
        y: 200 + Math.floor(index / cols) * 100
      }
    default:
      return { x: 200 + index * 100, y: 300 }
  }
}

function getObstaclePosition(index: number, template: GameTemplate, total: number): { x: number; y: number } {
  switch (template) {
    case 'platformer':
      return {
        x: 300 + (index * 150),
        y: 480
      }
    case 'endless-runner':
      return {
        x: 400 + (index * 120),
        y: 450
      }
    case 'top-down-collector':
      return {
        x: 250 + (index * 200),
        y: 150 + (index % 2) * 200
      }
    default:
      return { x: 300 + index * 150, y: 400 }
  }
}

function getGoalPosition(template: GameTemplate): { x: number; y: number } {
  switch (template) {
    case 'platformer':
      return { x: 720, y: 420 }
    case 'top-down-collector':
      return { x: 700, y: 500 }
    default:
      return { x: 720, y: 400 }
  }
}

function getObstacleCount(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 2
    case 'hard': return 6
    default: return 4 // medium
  }
}

// Quality metrics calculation
export interface GameQualityMetrics {
  overallScore: number // 1-100
  educationalValue: number // 1-100
  funFactor: number // 1-100
  technicalQuality: number // 1-100
  ageAppropriate: number // 1-100
  accessibility: number // 1-100
  details: {
    templateMatch: number
    themeConsistency: number
    balancing: number
    clarity: number
  }
}

function calculateGameQuality(spec: GameSpec, logic: GameLogic): GameQualityMetrics {
  // Template match quality (how well the template fits the content)
  const templateMatch = evaluateTemplateMatch(spec)
  
  // Theme consistency (how well assets and theme align)
  const themeConsistency = evaluateThemeConsistency(spec)
  
  // Game balancing (difficulty appropriate for age group)
  const balancing = evaluateGameBalance(spec)
  
  // Clarity (clear objectives and instructions)
  const clarity = evaluateGameClarity(spec, logic)
  
  const details = {
    templateMatch,
    themeConsistency,
    balancing,
    clarity
  }
  
  // Calculate component scores
  const educationalValue = Math.min(100, (spec.codingConcepts.length * 20) + (templateMatch * 0.4))
  const funFactor = Math.min(100, (themeConsistency * 0.6) + (balancing * 0.4))
  const technicalQuality = Math.min(100, (templateMatch * 0.4) + (clarity * 0.6))
  const ageAppropriate = Math.min(100, (balancing * 0.7) + (clarity * 0.3))
  const accessibility = Math.min(100, (clarity * 0.8) + (balancing * 0.2))
  
  const overallScore = Math.round(
    (educationalValue * 0.25 + funFactor * 0.25 + technicalQuality * 0.2 + ageAppropriate * 0.2 + accessibility * 0.1)
  )
  
  return {
    overallScore,
    educationalValue,
    funFactor,
    technicalQuality,
    ageAppropriate,
    accessibility,
    details
  }
}

function evaluateTemplateMatch(spec: GameSpec): number {
  const template = GAME_TEMPLATES[spec.template]
  
  let score = 80 // Base score
  
  // Check if concepts align with template
  const templateConcepts = template.concepts
  const specConcepts = spec.codingConcepts
  const conceptOverlap = specConcepts.filter(c => templateConcepts.includes(c)).length
  score += (conceptOverlap / specConcepts.length) * 20
  
  return Math.min(100, score)
}

function evaluateThemeConsistency(spec: GameSpec): number {
  const assetPack = ASSET_PACKS[spec.themePack]
  
  let score = 85 // Base score for using curated assets
  
  // Check title-theme alignment
  const titleLower = spec.title.toLowerCase()
  const themeKeywords = {
    forest: ['forest', 'tree', 'nature', 'wood', 'magic'],
    space: ['space', 'star', 'cosmic', 'galaxy', 'stellar'],
    ocean: ['ocean', 'sea', 'water', 'aquatic', 'deep']
  }
  
  const keywords = themeKeywords[spec.themePack]
  const hasThemeInTitle = keywords.some(keyword => titleLower.includes(keyword))
  if (hasThemeInTitle) score += 10
  
  return Math.min(100, score)
}

function evaluateGameBalance(spec: GameSpec): number {
  const ageRanges = {
    '4-6': { minTarget: 3, maxTarget: 8, easyDiff: true },
    '7-9': { minTarget: 5, maxTarget: 12, mediumDiff: true },
    '10-12': { minTarget: 8, maxTarget: 15, hardDiff: true }
  }
  
  const range = ageRanges[spec.ageGroup]
  let score = 70
  
  // Check win target appropriateness
  if (spec.winTarget >= range.minTarget && spec.winTarget <= range.maxTarget) {
    score += 15
  }
  
  // Check difficulty appropriateness
  if ((spec.difficulty === 'easy' && range.easyDiff) ||
      (spec.difficulty === 'medium' && range.mediumDiff) ||
      (spec.difficulty === 'hard' && range.hardDiff)) {
    score += 15
  }
  
  return Math.min(100, score)
}

function evaluateGameClarity(spec: GameSpec, logic: GameLogic): number {
  let score = 80
  
  // Check if instructions are clear
  if (spec.zambooMessages.instructions.length > 20) score += 10
  
  // Check if description is informative
  if (spec.description.length > 30) score += 5
  
  // Check if learning objectives are present
  if (spec.learningObjectives.length > 0) score += 5
  
  return Math.min(100, score)
}

// Assembly metadata
export interface AssemblyMetadata {
  assemblyTime: Date
  template: GameTemplate
  themePack: ThemePack
  prompt: string
  engineVersion: string
  qualityScore: number
  fallbacksUsed: string[]
  optimizations: string[]
}

function getAppliedOptimizations(spec: GameSpec): string[] {
  const optimizations: string[] = []
  
  optimizations.push('Template-based assembly')
  optimizations.push('Curated asset integration')
  optimizations.push('Age-appropriate balancing')
  
  if (spec.template === 'top-down-collector' && spec.ageGroup === '4-6') {
    optimizations.push('Simplified mechanics for young players')
  }
  
  if (spec.themePack === 'forest') {
    optimizations.push('Nature-themed educational concepts')
  }
  
  return optimizations
}

// Quality validation and auto-improvement
export function validateAndImproveGame(
  spec: GameSpec,
  logic: GameLogic
): {
  improved: boolean
  suggestions: string[]
  criticalIssues: string[]
} {
  const suggestions: string[] = []
  const criticalIssues: string[] = []
  let improved = false
  
  // Check for critical issues
  if (spec.winTarget < 1) {
    criticalIssues.push('Win target must be at least 1')
  }
  
  if (!spec.zambooMessages.welcome || spec.zambooMessages.welcome.length < 10) {
    criticalIssues.push('Welcome message too short or missing')
  }
  
  // Performance suggestions
  if (spec.winTarget > 20) {
    suggestions.push('Consider reducing collectibles for better performance')
  }
  
  // Educational suggestions
  if (spec.codingConcepts.length < 2) {
    suggestions.push('Add more coding concepts for better educational value')
  }
  
  // Age appropriateness suggestions
  if (spec.ageGroup === '4-6' && spec.difficulty === 'hard') {
    suggestions.push('Consider easier difficulty for younger players')
    improved = true
  }
  
  return {
    improved,
    suggestions,
    criticalIssues
  }
}

// Export main functions
export {
  createZambooGame,
  convertSpecToGameLogic,
  calculateGameQuality,
  validateAndImproveGame
}