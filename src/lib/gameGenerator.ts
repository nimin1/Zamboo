import type { GameLogic, DeepSeekRequest, DeepSeekResponse, GameTemplateInfo } from '@/types'
import { createCollectorTemplate, createMazeTemplate } from './gameLogicSchema'

export class GameGenerator {
  private static apiEndpoint = '/api/generateGame'

  static async generateGame(request: DeepSeekRequest): Promise<DeepSeekResponse> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to generate game')
      }

      return await response.json()
    } catch (error) {
      console.error('Game generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        suggestions: [
          'Try a simpler game idea',
          'Check your internet connection',
          'Use one of our templates instead'
        ]
      }
    }
  }

  static createTemplateGame(templateId: string, customizations?: Partial<GameLogic>): GameLogic {
    const templates = this.getAvailableTemplates()
    const template = templates.find(t => t.id === templateId)
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const gameLogic: GameLogic = {
      ...template.gameLogic,
      id: `template_${templateId}_${Date.now()}`,
      ...customizations
    }

    return gameLogic
  }

  static getAvailableTemplates(): GameTemplateInfo[] {
    return [
      {
        id: 'star_collector',
        name: 'Star Collector',
        description: 'Collect all the golden stars while avoiding obstacles!',
        thumbnail: '⭐',
        difficulty: 'easy',
        concepts: ['loops', 'events'],
        featured: true,
        gameLogic: this.createStarCollectorTemplate()
      },
      {
        id: 'bamboo_maze',
        name: 'Bamboo Maze',
        description: 'Help Zamboo navigate through the bamboo maze to find the exit!',
        thumbnail: '🎋',
        difficulty: 'medium',
        concepts: ['conditions', 'logic'],
        featured: true,
        gameLogic: this.createBambooMazeTemplate()
      },
      {
        id: 'rocket_adventure',
        name: 'Rocket Adventure',
        description: 'Fly your rocket through space and collect gems!',
        thumbnail: '🚀',
        difficulty: 'easy',
        concepts: ['physics', 'events'],
        featured: true,
        gameLogic: this.createRocketAdventureTemplate()
      },
      {
        id: 'panda_platformer',
        name: 'Panda Platformer',
        description: 'Jump on platforms and collect bamboo leaves!',
        thumbnail: '🐼',
        difficulty: 'medium',
        concepts: ['physics', 'conditions', 'loops'],
        featured: false,
        gameLogic: this.createPandaPlatformerTemplate()
      }
    ]
  }

  private static createStarCollectorTemplate(): GameLogic {
    const base = createCollectorTemplate('Star Collector', 'star')
    return {
      id: 'star_collector_template',
      title: 'Star Collector',
      description: 'Collect all the golden stars to win!',
      difficulty: 'easy',
      ageGroup: '5-7',
      
      worldSize: { width: 800, height: 600 },
      background: {
        type: 'starfield',
        colors: ['#000033', '#000066']
      },
      
      objects: [
        {
          id: 'player',
          type: 'player',
          sprite: { type: 'circle', color: '#FF6B9D' },
          position: { x: 50, y: 300 },
          size: { width: 40, height: 40 },
          physics: { gravity: 0, friction: 0.95, bounce: 0.3, mass: 1 },
          collidable: true,
          visible: true
        },
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `star_${i + 1}`,
          type: 'collectible' as const,
          sprite: { type: 'star' as const, color: '#FFD700' },
          position: { x: 150 + i * 120, y: 200 + Math.sin(i) * 100 },
          size: { width: 30, height: 30 },
          points: 20,
          animation: { type: 'spin' as const, duration: 2000, repeat: true, easing: 'linear' as const },
          collidable: true,
          visible: true
        }))
      ],
      
      events: [
        ...Array.from({ length: 5 }, (_, i) => ({
          id: `collect_star_${i + 1}`,
          trigger: 'collision' as const,
          condition: { objectId: `star_${i + 1}` },
          actions: [
            { type: 'score' as const, value: 20 },
            { type: 'destroy' as const, targetId: `star_${i + 1}` },
            { type: 'effect' as const, value: 'sparkles' }
          ]
        }))
      ],
      
      rules: {
        winConditions: [{ type: 'collect_all' }],
        scoring: { enabled: true, multiplier: 1 }
      },
      
      controls: {
        type: 'arrows',
        mouseEnabled: true,
        touchEnabled: true
      },
      
      concepts: base.concepts || [],
      zambooDialogue: base.zambooDialogue!,
      createdBy: 'template',
      template: 'star_collector',
      version: '1.0'
    }
  }

  private static createBambooMazeTemplate(): GameLogic {
    const base = createMazeTemplate('Bamboo Maze Adventure')
    return {
      id: 'bamboo_maze_template',
      title: 'Bamboo Maze Adventure',
      description: 'Navigate through the bamboo maze to reach the exit!',
      difficulty: 'medium',
      ageGroup: '8-10',
      
      worldSize: { width: 800, height: 600 },
      background: {
        type: 'bamboo',
        colors: ['#90EE90', '#228B22']
      },
      
      objects: [
        {
          id: 'player',
          type: 'player',
          sprite: { type: 'panda', color: '#FFFFFF' },
          position: { x: 50, y: 50 },
          size: { width: 35, height: 35 },
          physics: { gravity: 0, friction: 0.9, bounce: 0, mass: 1 },
          collidable: true,
          visible: true
        },
        // Maze walls
        ...this.createMazeWalls(),
        {
          id: 'exit',
          type: 'goal',
          sprite: { type: 'bamboo', color: '#32CD32' },
          position: { x: 720, y: 520 },
          size: { width: 50, height: 50 },
          animation: { type: 'pulse', duration: 1500, repeat: true, easing: 'ease' },
          collidable: true,
          visible: true
        }
      ],
      
      events: [
        {
          id: 'reach_exit',
          trigger: 'collision',
          condition: { objectId: 'exit' },
          actions: [
            { type: 'score', value: 100 },
            { type: 'win' }
          ]
        }
      ],
      
      rules: {
        winConditions: [{ type: 'reach_goal' }],
        scoring: { enabled: true, multiplier: 1 }
      },
      
      controls: {
        type: 'arrows',
        mouseEnabled: false,
        touchEnabled: true
      },
      
      concepts: base.concepts || [],
      zambooDialogue: base.zambooDialogue!,
      createdBy: 'template',
      template: 'bamboo_maze',
      version: '1.0'
    }
  }

  private static createRocketAdventureTemplate(): GameLogic {
    return {
      id: 'rocket_adventure_template',
      title: 'Rocket Adventure',
      description: 'Pilot your rocket through space and collect precious gems!',
      difficulty: 'easy',
      ageGroup: '5-7',
      
      worldSize: { width: 800, height: 600 },
      background: {
        type: 'starfield',
        colors: ['#000022', '#000044']
      },
      
      objects: [
        {
          id: 'player',
          type: 'player',
          sprite: { type: 'triangle', color: '#FF4500' },
          position: { x: 100, y: 300 },
          size: { width: 30, height: 40 },
          physics: { gravity: 100, friction: 0.98, bounce: 0, mass: 1 },
          collidable: true,
          visible: true
        },
        ...Array.from({ length: 6 }, (_, i) => ({
          id: `gem_${i + 1}`,
          type: 'collectible' as const,
          sprite: { type: 'diamond' as const, color: i % 2 === 0 ? '#00FFFF' : '#FF00FF' },
          position: { x: 200 + i * 80, y: 150 + Math.sin(i * 0.5) * 150 },
          size: { width: 25, height: 25 },
          points: 15,
          animation: { type: 'float' as const, duration: 2500, repeat: true, easing: 'ease' as const },
          collidable: true,
          visible: true
        }))
      ],
      
      events: [
        ...Array.from({ length: 6 }, (_, i) => ({
          id: `collect_gem_${i + 1}`,
          trigger: 'collision' as const,
          condition: { objectId: `gem_${i + 1}` },
          actions: [
            { type: 'score' as const, value: 15 },
            { type: 'destroy' as const, targetId: `gem_${i + 1}` },
            { type: 'effect' as const, value: 'sparkles' }
          ]
        }))
      ],
      
      rules: {
        winConditions: [{ type: 'collect_all' }],
        scoring: { enabled: true, multiplier: 1 }
      },
      
      controls: {
        type: 'arrows',
        mouseEnabled: true,
        touchEnabled: true
      },
      
      concepts: [
        {
          id: 'physics',
          name: 'Physics',
          description: 'Objects can fall down because of gravity, just like in real life!',
          examples: ['Rockets need thrust to fly up!', 'Things fall down without power!'],
          difficulty: 'beginner',
          category: 'logic'
        },
        {
          id: 'events',
          name: 'Events',
          description: 'When something happens, like collecting a gem, the game reacts!',
          examples: ['Touch gem → get points!', 'Press key → rocket moves!'],
          difficulty: 'beginner',
          category: 'events'
        }
      ],
      
      zambooDialogue: {
        welcome: 'Ready for a space adventure? I\'m Zamboo, and I\'ll help you pilot this rocket! 🚀',
        instructions: 'Use arrow keys to fly your rocket and collect all the colorful gems!',
        encouragement: [
          'Great piloting!',
          'You\'re a natural astronaut!',
          'Collect them all, space explorer!'
        ],
        victory: 'Outstanding! You\'re the best rocket pilot in the galaxy! 🌟🚀',
        defeat: 'Space travel is tricky! Let\'s practice more and try again! 🛸'
      },
      
      createdBy: 'template',
      template: 'rocket_adventure',
      version: '1.0'
    }
  }

  private static createPandaPlatformerTemplate(): GameLogic {
    return {
      id: 'panda_platformer_template',
      title: 'Panda Platformer',
      description: 'Jump on platforms and collect bamboo leaves!',
      difficulty: 'medium',
      ageGroup: '8-10',
      
      worldSize: { width: 800, height: 600 },
      background: {
        type: 'gradient',
        colors: ['#87CEEB', '#98FB98']
      },
      
      objects: [
        {
          id: 'player',
          type: 'player',
          sprite: { type: 'panda', color: '#000000' },
          position: { x: 50, y: 450 },
          size: { width: 40, height: 40 },
          physics: { gravity: 500, friction: 0.92, bounce: 0, mass: 1 },
          collidable: true,
          visible: true
        },
        // Platforms
        ...this.createPlatforms(),
        // Bamboo collectibles
        ...Array.from({ length: 4 }, (_, i) => ({
          id: `bamboo_${i + 1}`,
          type: 'collectible' as const,
          sprite: { type: 'bamboo' as const, color: '#228B22' },
          position: { x: 200 + i * 150, y: 350 - i * 80 },
          size: { width: 20, height: 30 },
          points: 25,
          animation: { type: 'bounce' as const, duration: 1500, repeat: true, easing: 'ease' as const },
          collidable: true,
          visible: true
        }))
      ],
      
      events: [
        ...Array.from({ length: 4 }, (_, i) => ({
          id: `collect_bamboo_${i + 1}`,
          trigger: 'collision' as const,
          condition: { objectId: `bamboo_${i + 1}` },
          actions: [
            { type: 'score' as const, value: 25 },
            { type: 'destroy' as const, targetId: `bamboo_${i + 1}` },
            { type: 'effect' as const, value: 'leaves' }
          ]
        }))
      ],
      
      rules: {
        winConditions: [{ type: 'collect_all' }],
        scoring: { enabled: true, multiplier: 1 }
      },
      
      controls: {
        type: 'arrows',
        mouseEnabled: false,
        touchEnabled: true
      },
      
      concepts: [
        {
          id: 'physics',
          name: 'Gravity & Physics',
          description: 'Pandas fall down but can jump up! Physics makes games feel real.',
          examples: ['Jump to reach higher platforms!', 'Gravity pulls you down!'],
          difficulty: 'intermediate',
          category: 'logic'
        },
        {
          id: 'conditions',
          name: 'If-Then Logic',
          description: 'IF you jump at the right time, THEN you land on the platform!',
          examples: ['If on ground, then can jump', 'If touching bamboo, then collect it'],
          difficulty: 'intermediate',
          category: 'conditions'
        }
      ],
      
      zambooDialogue: {
        welcome: 'Hey there, fellow panda! I\'m Zamboo! Let\'s jump around and collect bamboo! 🐼🎋',
        instructions: 'Use arrow keys to move and jump on platforms to reach the bamboo!',
        encouragement: [
          'Nice jump!',
          'You\'re getting good at this!',
          'Keep bouncing, panda pal!'
        ],
        victory: 'Incredible! You collected all the bamboo! You\'re a jumping champion! 🏆🎋',
        defeat: 'Jumping takes practice! Let\'s try again - you\'ve got this! 💪'
      },
      
      createdBy: 'template',
      template: 'panda_platformer',
      version: '1.0'
    }
  }

  private static createMazeWalls(): any[] {
    // Simple maze wall pattern
    const walls: any[] = []
    const wallPositions = [
      { x: 150, y: 100, w: 20, h: 100 },
      { x: 250, y: 200, w: 100, h: 20 },
      { x: 400, y: 150, w: 20, h: 120 },
      { x: 500, y: 300, w: 80, h: 20 },
      { x: 300, y: 400, w: 150, h: 20 },
      { x: 600, y: 250, w: 20, h: 100 }
    ]

    wallPositions.forEach((wall, i) => {
      walls.push({
        id: `wall_${i + 1}`,
        type: 'obstacle' as const,
        sprite: { type: 'square' as const, color: '#8B4513' },
        position: { x: wall.x, y: wall.y },
        size: { width: wall.w, height: wall.h },
        collidable: true,
        visible: true
      })
    })

    return walls
  }

  private static createPlatforms(): any[] {
    const platforms: any[] = []
    const platformPositions = [
      { x: 0, y: 550, w: 800, h: 50 }, // Ground
      { x: 150, y: 450, w: 100, h: 20 },
      { x: 300, y: 350, w: 100, h: 20 },
      { x: 450, y: 250, w: 100, h: 20 },
      { x: 600, y: 400, w: 100, h: 20 }
    ]

    platformPositions.forEach((platform, i) => {
      platforms.push({
        id: `platform_${i + 1}`,
        type: 'platform' as const,
        sprite: { type: 'square' as const, color: '#8B7355' },
        position: { x: platform.x, y: platform.y },
        size: { width: platform.w, height: platform.h },
        collidable: true,
        visible: true
      })
    })

    return platforms
  }
}

export default GameGenerator