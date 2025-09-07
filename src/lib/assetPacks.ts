// Curated Asset Packs for Zamboo
// High-quality, theme-consistent assets for professional game appearance

import type { ThemePack } from '@/types/gamespec'

// Asset configuration interface
export interface AssetConfig {
  id: string
  name: string
  description: string
  color: string
  size: { width: number; height: number }
  animations?: string[]
  sounds?: string[]
  particles?: string[]
}

// Complete asset pack interface
export interface AssetPack {
  id: ThemePack
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string[]
    collectible: string
    obstacle: string
    platform: string
  }
  player: AssetConfig
  collectibles: AssetConfig[]
  obstacles: AssetConfig[]
  platforms: AssetConfig[]
  decorations: AssetConfig[]
  particles: string[]
  sounds: {
    collect: string
    jump: string
    victory: string
    hurt: string
    background: string
  }
  backgroundLayers: string[]
}

// 🌲 FOREST ASSET PACK
export const FOREST_ASSET_PACK: AssetPack = {
  id: 'forest',
  name: 'Magical Forest',
  description: 'Enchanted woodland with mystical creatures and ancient trees',
  colors: {
    primary: '#4A7C59',      // Forest green
    secondary: '#8FBC8F',    // Light green
    accent: '#FFD700',       // Golden yellow
    background: ['#87CEEB', '#98FB98'], // Sky blue to light green
    collectible: '#FFD700',  // Gold coins/acorns
    obstacle: '#8B4513',     // Tree trunk brown
    platform: '#CD853F'     // Log brown
  },
  player: {
    id: 'forest-explorer',
    name: 'Forest Explorer',
    description: 'A brave adventurer exploring the magical forest',
    color: '#4F46E5',
    size: { width: 32, height: 32 },
    animations: ['idle', 'walk', 'jump', 'collect'],
    sounds: ['footstep_grass', 'jump_soft'],
    particles: ['leaf_trail']
  },
  collectibles: [
    {
      id: 'golden-acorn',
      name: 'Golden Acorn',
      description: 'Magical acorns that sparkle with forest energy',
      color: '#FFD700',
      size: { width: 24, height: 24 },
      animations: ['idle_sparkle', 'collect_burst'],
      sounds: ['acorn_collect', 'magical_chime'],
      particles: ['golden_sparkle', 'leaf_burst']
    },
    {
      id: 'forest-gem',
      name: 'Forest Crystal',
      description: 'Mystical crystals formed by ancient tree magic',
      color: '#00FF7F',
      size: { width: 20, height: 28 },
      animations: ['crystal_glow', 'collect_shine'],
      sounds: ['crystal_collect', 'nature_harmony'],
      particles: ['crystal_light', 'nature_sparkle']
    },
    {
      id: 'magic-flower',
      name: 'Enchanted Flower',
      description: 'Beautiful flowers that glow with magical power',
      color: '#FF69B4',
      size: { width: 28, height: 28 },
      animations: ['flower_bloom', 'collect_petals'],
      sounds: ['flower_collect', 'nature_bell'],
      particles: ['petal_shower', 'fairy_dust']
    }
  ],
  obstacles: [
    {
      id: 'tree-trunk',
      name: 'Fallen Log',
      description: 'Ancient tree trunks that block your path',
      color: '#8B4513',
      size: { width: 64, height: 48 },
      animations: ['bark_texture', 'moss_growth'],
      sounds: ['wood_bump'],
      particles: ['bark_chips']
    },
    {
      id: 'thorny-bush',
      name: 'Thorny Bush',
      description: 'Prickly bushes that must be avoided',
      color: '#228B22',
      size: { width: 48, height: 36 },
      animations: ['thorn_wiggle', 'leaf_rustle'],
      sounds: ['bush_rustle', 'thorn_prick'],
      particles: ['thorn_sparkle', 'leaf_scatter']
    }
  ],
  platforms: [
    {
      id: 'moss-log',
      name: 'Mossy Log',
      description: 'Sturdy logs covered in soft, springy moss',
      color: '#8FBC8F',
      size: { width: 96, height: 24 },
      animations: ['moss_glow', 'wood_grain'],
      sounds: ['wood_step'],
      particles: ['moss_sparkle']
    },
    {
      id: 'tree-branch',
      name: 'Tree Branch',
      description: 'Strong branches perfect for jumping',
      color: '#A0522D',
      size: { width: 128, height: 16 },
      animations: ['branch_sway', 'bark_detail'],
      sounds: ['branch_creak'],
      particles: ['leaf_fall']
    }
  ],
  decorations: [
    {
      id: 'forest-firefly',
      name: 'Magical Firefly',
      description: 'Glowing insects that light up the forest',
      color: '#FFFFE0',
      size: { width: 8, height: 8 },
      animations: ['firefly_glow', 'firefly_dance'],
      particles: ['light_trail']
    },
    {
      id: 'forest-mushroom',
      name: 'Glowing Mushroom',
      description: 'Bioluminescent mushrooms growing on trees',
      color: '#9370DB',
      size: { width: 16, height: 20 },
      animations: ['mushroom_glow', 'spore_release'],
      particles: ['spore_cloud']
    }
  ],
  particles: ['leaf_burst', 'sparkle', 'dust_motes', 'firefly_trail', 'moss_shimmer'],
  sounds: {
    collect: 'magical_chime',
    jump: 'nature_bounce',
    victory: 'forest_celebration',
    hurt: 'nature_gasp',
    background: 'forest_ambience'
  },
  backgroundLayers: ['forest_sky', 'distant_trees', 'middle_trees', 'foreground_plants']
}

// 🚀 SPACE ASSET PACK
export const SPACE_ASSET_PACK: AssetPack = {
  id: 'space',
  name: 'Cosmic Adventure',
  description: 'Infinite cosmos with stars, planets, and alien technology',
  colors: {
    primary: '#4B0082',      // Cosmic purple
    secondary: '#9370DB',    // Medium purple
    accent: '#00FFFF',       // Cyan
    background: ['#000428', '#004e92'], // Deep space gradient
    collectible: '#00FFFF',  // Cyan stars
    obstacle: '#8B008B',     // Dark magenta asteroids
    platform: '#6495ED'     // Cornflower blue
  },
  player: {
    id: 'space-explorer',
    name: 'Space Explorer',
    description: 'Brave astronaut exploring the vast cosmos',
    color: '#E6E6FA',
    size: { width: 32, height: 32 },
    animations: ['float_idle', 'jetpack_boost', 'zero_gravity_jump'],
    sounds: ['jetpack_fire', 'space_jump'],
    particles: ['jetpack_flame', 'space_trail']
  },
  collectibles: [
    {
      id: 'cosmic-star',
      name: 'Cosmic Star',
      description: 'Brilliant stars that power your space journey',
      color: '#FFFF00',
      size: { width: 28, height: 28 },
      animations: ['star_twinkle', 'collect_burst'],
      sounds: ['star_collect', 'cosmic_chime'],
      particles: ['star_explosion', 'cosmic_dust']
    },
    {
      id: 'energy-crystal',
      name: 'Energy Crystal',
      description: 'Alien crystals containing pure cosmic energy',
      color: '#00FFFF',
      size: { width: 24, height: 32 },
      animations: ['crystal_pulse', 'energy_surge'],
      sounds: ['energy_collect', 'tech_beep'],
      particles: ['energy_bolt', 'electric_spark']
    },
    {
      id: 'space-orb',
      name: 'Quantum Orb',
      description: 'Mysterious orbs containing alien technology',
      color: '#FF69B4',
      size: { width: 26, height: 26 },
      animations: ['orb_rotate', 'quantum_flicker'],
      sounds: ['orb_collect', 'quantum_hum'],
      particles: ['quantum_wave', 'tech_sparkle']
    }
  ],
  obstacles: [
    {
      id: 'asteroid',
      name: 'Space Asteroid',
      description: 'Rocky asteroids floating through space',
      color: '#696969',
      size: { width: 56, height: 48 },
      animations: ['asteroid_rotate', 'rock_texture'],
      sounds: ['rock_bump'],
      particles: ['rock_debris', 'space_dust']
    },
    {
      id: 'laser-barrier',
      name: 'Energy Barrier',
      description: 'Dangerous energy fields that block your path',
      color: '#FF0000',
      size: { width: 8, height: 64 },
      animations: ['laser_pulse', 'energy_crackle'],
      sounds: ['laser_hum', 'energy_zap'],
      particles: ['electric_arc', 'energy_wave']
    }
  ],
  platforms: [
    {
      id: 'space-platform',
      name: 'Space Platform',
      description: 'Advanced alien platforms floating in space',
      color: '#4169E1',
      size: { width: 112, height: 20 },
      animations: ['platform_glow', 'tech_pulse'],
      sounds: ['tech_step'],
      particles: ['tech_glow', 'energy_field']
    },
    {
      id: 'satellite',
      name: 'Satellite Platform',
      description: 'Old satellites repurposed as stepping stones',
      color: '#C0C0C0',
      size: { width: 96, height: 24 },
      animations: ['satellite_blink', 'antenna_move'],
      sounds: ['metal_clang'],
      particles: ['signal_wave']
    }
  ],
  decorations: [
    {
      id: 'space-nebula',
      name: 'Colorful Nebula',
      description: 'Beautiful cosmic clouds in the background',
      color: '#9370DB',
      size: { width: 128, height: 96 },
      animations: ['nebula_swirl', 'color_shift'],
      particles: ['cosmic_dust', 'star_birth']
    },
    {
      id: 'alien-probe',
      name: 'Alien Probe',
      description: 'Mysterious alien technology scanning the area',
      color: '#00FF00',
      size: { width: 24, height: 16 },
      animations: ['probe_scan', 'light_beam'],
      particles: ['scan_line', 'alien_tech']
    }
  ],
  particles: ['star_dust', 'nebula', 'sparkle', 'cosmic_ray', 'energy_pulse'],
  sounds: {
    collect: 'cosmic_chime',
    jump: 'jetpack_boost',
    victory: 'space_triumph',
    hurt: 'energy_drain',
    background: 'space_ambient'
  },
  backgroundLayers: ['deep_space', 'distant_stars', 'nebula_clouds', 'space_debris']
}

// 🌊 OCEAN ASSET PACK
export const OCEAN_ASSET_PACK: AssetPack = {
  id: 'ocean',
  name: 'Deep Sea Adventure',
  description: 'Underwater world with coral reefs and sea creatures',
  colors: {
    primary: '#006994',      // Deep ocean blue
    secondary: '#47B5FF',    // Light ocean blue
    accent: '#FFB84D',       // Coral orange
    background: ['#0077be', '#00a8cc'], // Ocean gradient
    collectible: '#FFB84D',  // Pearl/coral color
    obstacle: '#2F4F4F',     // Dark slate gray (sharks)
    platform: '#FF7F50'     // Coral color
  },
  player: {
    id: 'sea-explorer',
    name: 'Sea Explorer',
    description: 'Underwater adventurer exploring ocean depths',
    color: '#20B2AA',
    size: { width: 32, height: 32 },
    animations: ['swim_idle', 'swim_fast', 'bubble_trail'],
    sounds: ['swim_stroke', 'underwater_move'],
    particles: ['bubble_stream', 'water_trail']
  },
  collectibles: [
    {
      id: 'ocean-pearl',
      name: 'Luminous Pearl',
      description: 'Beautiful pearls that glow in the deep sea',
      color: '#FFF8DC',
      size: { width: 22, height: 22 },
      animations: ['pearl_glow', 'collect_ripple'],
      sounds: ['pearl_collect', 'water_chime'],
      particles: ['pearl_light', 'bubble_burst']
    },
    {
      id: 'coral-gem',
      name: 'Coral Crystal',
      description: 'Sparkling gems formed by ancient coral',
      color: '#FF7F50',
      size: { width: 24, height: 30 },
      animations: ['coral_pulse', 'gem_shine'],
      sounds: ['gem_collect', 'ocean_bell'],
      particles: ['coral_sparkle', 'sea_magic']
    },
    {
      id: 'sea-shell',
      name: 'Magic Shell',
      description: 'Enchanted shells that sing ocean melodies',
      color: '#FFB6C1',
      size: { width: 26, height: 24 },
      animations: ['shell_open', 'music_notes'],
      sounds: ['shell_collect', 'ocean_song'],
      particles: ['music_wave', 'shell_shimmer']
    }
  ],
  obstacles: [
    {
      id: 'sea-urchin',
      name: 'Spiky Urchin',
      description: 'Prickly sea urchins that must be avoided',
      color: '#8B008B',
      size: { width: 36, height: 36 },
      animations: ['urchin_pulse', 'spike_extend'],
      sounds: ['spike_warning'],
      particles: ['danger_glow', 'spike_glint']
    },
    {
      id: 'jellyfish',
      name: 'Electric Jellyfish',
      description: 'Beautiful but dangerous jellyfish',
      color: '#9370DB',
      size: { width: 48, height: 56 },
      animations: ['jellyfish_float', 'tentacle_wave'],
      sounds: ['electric_buzz'],
      particles: ['electric_pulse', 'bio_light']
    }
  ],
  platforms: [
    {
      id: 'coral-reef',
      name: 'Coral Platform',
      description: 'Strong coral formations perfect for resting',
      color: '#FF6347',
      size: { width: 104, height: 28 },
      animations: ['coral_sway', 'fish_swim_by'],
      sounds: ['coral_step'],
      particles: ['coral_polyp', 'sea_life']
    },
    {
      id: 'sea-rock',
      name: 'Ocean Rock',
      description: 'Smooth rocks carved by ocean currents',
      color: '#708090',
      size: { width: 88, height: 22 },
      animations: ['algae_grow', 'barnacle_cluster'],
      sounds: ['rock_thud'],
      particles: ['sediment_cloud']
    }
  ],
  decorations: [
    {
      id: 'sea-anemone',
      name: 'Sea Anemone',
      description: 'Colorful anemones swaying in the current',
      color: '#FF1493',
      size: { width: 20, height: 32 },
      animations: ['anemone_sway', 'tentacle_dance'],
      particles: ['current_flow']
    },
    {
      id: 'kelp-forest',
      name: 'Kelp Strands',
      description: 'Tall kelp plants creating underwater forests',
      color: '#2E8B57',
      size: { width: 12, height: 80 },
      animations: ['kelp_wave', 'current_bend'],
      particles: ['kelp_spores']
    }
  ],
  particles: ['bubbles', 'splash', 'sparkle', 'current_flow', 'bio_luminescence'],
  sounds: {
    collect: 'bubble_pop',
    jump: 'water_splash',
    victory: 'ocean_celebration',
    hurt: 'water_gasp',
    background: 'underwater_ambient'
  },
  backgroundLayers: ['ocean_depth', 'distant_reef', 'kelp_forest', 'foreground_coral']
}

// Asset pack registry
export const ASSET_PACKS: Record<ThemePack, AssetPack> = {
  forest: FOREST_ASSET_PACK,
  space: SPACE_ASSET_PACK,
  ocean: OCEAN_ASSET_PACK
}

// 🎨 Asset Utility Functions
export function getAssetPack(themePack: ThemePack): AssetPack {
  return ASSET_PACKS[themePack]
}

export function getPlayerAsset(themePack: ThemePack): AssetConfig {
  return ASSET_PACKS[themePack].player
}

export function getCollectibleAssets(themePack: ThemePack): AssetConfig[] {
  return ASSET_PACKS[themePack].collectibles
}

export function getObstacleAssets(themePack: ThemePack): AssetConfig[] {
  return ASSET_PACKS[themePack].obstacles
}

export function getPlatformAssets(themePack: ThemePack): AssetConfig[] {
  return ASSET_PACKS[themePack].platforms
}

export function getDecorationAssets(themePack: ThemePack): AssetConfig[] {
  return ASSET_PACKS[themePack].decorations
}

// 🎵 Sound and Particle Utilities
export function getThemeSounds(themePack: ThemePack) {
  return ASSET_PACKS[themePack].sounds
}

export function getThemeParticles(themePack: ThemePack): string[] {
  return ASSET_PACKS[themePack].particles
}

export function getThemeColors(themePack: ThemePack) {
  return ASSET_PACKS[themePack].colors
}

// 🎯 Smart Asset Selection
export function selectBestCollectible(themePack: ThemePack, gameContext?: string): AssetConfig {
  const collectibles = getCollectibleAssets(themePack)
  
  if (gameContext) {
    const context = gameContext.toLowerCase()
    
    // Context-based selection
    if (context.includes('coin') || context.includes('money')) {
      return collectibles.find(c => c.id.includes('acorn') || c.id.includes('pearl')) || collectibles[0]
    }
    if (context.includes('crystal') || context.includes('gem')) {
      return collectibles.find(c => c.id.includes('crystal') || c.id.includes('gem')) || collectibles[1]
    }
    if (context.includes('magic') || context.includes('power')) {
      return collectibles.find(c => c.id.includes('flower') || c.id.includes('orb')) || collectibles[2]
    }
  }
  
  // Default to first collectible
  return collectibles[0]
}

export function selectBestObstacle(themePack: ThemePack, difficulty: string): AssetConfig {
  const obstacles = getObstacleAssets(themePack)
  
  // Difficulty-based selection
  if (difficulty === 'easy') {
    return obstacles.find(o => !o.animations?.includes('laser') && !o.animations?.includes('electric')) || obstacles[0]
  } else if (difficulty === 'hard') {
    return obstacles.find(o => o.animations?.some(a => a.includes('laser') || a.includes('electric'))) || obstacles[1]
  }
  
  // Default selection
  return obstacles[0]
}

// 📊 Asset Quality Validation
export interface AssetQualityReport {
  themePack: ThemePack
  consistency: number // 1-10
  completeness: number // 1-10
  accessibility: number // 1-10
  performance: number // 1-10
  overallQuality: number // 1-10
  recommendations: string[]
}

export function validateAssetQuality(themePack: ThemePack): AssetQualityReport {
  const pack = getAssetPack(themePack)
  const recommendations: string[] = []
  
  // Check consistency (colors, sizes, style)
  const consistency = evaluateConsistency(pack, recommendations)
  
  // Check completeness (required assets present)
  const completeness = evaluateCompleteness(pack, recommendations)
  
  // Check accessibility (color contrast, size)
  const accessibility = evaluateAccessibility(pack, recommendations)
  
  // Check performance (reasonable asset sizes)
  const performance = evaluatePerformance(pack, recommendations)
  
  const overallQuality = Math.round((consistency + completeness + accessibility + performance) / 4 * 10) / 10
  
  return {
    themePack,
    consistency,
    completeness,
    accessibility,
    performance,
    overallQuality,
    recommendations
  }
}

function evaluateConsistency(pack: AssetPack, recommendations: string[]): number {
  let score = 10
  
  // Check color harmony
  const colors = Object.values(pack.colors).flat()
  if (colors.length < 5) {
    score -= 1
    recommendations.push('Add more color variations for better visual variety')
  }
  
  // Check size consistency
  const sizes = [pack.player, ...pack.collectibles, ...pack.obstacles].map(a => a.size.width * a.size.height)
  const sizeVariation = Math.max(...sizes) / Math.min(...sizes)
  if (sizeVariation > 10) {
    score -= 1
    recommendations.push('Consider more consistent asset sizing')
  }
  
  return score
}

function evaluateCompleteness(pack: AssetPack, recommendations: string[]): number {
  let score = 10
  
  if (pack.collectibles.length < 2) {
    score -= 2
    recommendations.push('Add more collectible varieties')
  }
  
  if (pack.obstacles.length < 2) {
    score -= 2
    recommendations.push('Add more obstacle types')
  }
  
  if (pack.platforms.length < 2) {
    score -= 1
    recommendations.push('Consider adding more platform varieties')
  }
  
  return score
}

function evaluateAccessibility(pack: AssetPack, recommendations: string[]): number {
  let score = 10
  
  // Check if player stands out from background
  const playerColor = pack.player.color
  const bgColors = pack.colors.background
  
  // Simple contrast check (would need more sophisticated algorithm in real app)
  if (playerColor === bgColors[0] || playerColor === bgColors[1]) {
    score -= 2
    recommendations.push('Improve player visibility against background')
  }
  
  // Check asset sizes for young players
  if (pack.player.size.width < 24 || pack.player.size.height < 24) {
    score -= 1
    recommendations.push('Consider larger player asset for better visibility')
  }
  
  return score
}

function evaluatePerformance(pack: AssetPack, recommendations: string[]): number {
  let score = 10
  
  // Check for reasonable asset counts
  const totalAssets = 1 + pack.collectibles.length + pack.obstacles.length + pack.platforms.length + pack.decorations.length
  if (totalAssets > 20) {
    score -= 1
    recommendations.push('Consider reducing asset count for better performance')
  }
  
  // Check animation complexity
  const totalAnimations = [pack.player, ...pack.collectibles, ...pack.obstacles]
    .reduce((total, asset) => total + (asset.animations?.length || 0), 0)
  if (totalAnimations > 50) {
    score -= 1
    recommendations.push('Consider simplifying animations for better performance')
  }
  
  return score
}

// All functions and constants are already exported individually above