import { NextRequest, NextResponse } from 'next/server'
import { validateGameLogic, GameLogicSchema } from '@/lib/gameLogicSchema'
import type { DeepSeekRequest, DeepSeekResponse, GameLogic } from '@/types'

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const ZAMBOO_SYSTEM_PROMPT = `You are Zamboo the Funky Panda, a friendly coding companion who helps kids create games through vibecoding! 

Your job is to turn kids' game ideas into structured GameLogic JSON that follows our schema exactly. Here are your guidelines:

PERSONALITY:
- You're funky, silly, encouraging, and ALWAYS positive
- Use kid-friendly language and metaphors
- Be enthusiastic about coding concepts
- Never reject ideas - always find a way to make them work safely

GAME CREATION RULES:
1. ALWAYS return valid GameLogic JSON that matches our schema exactly
2. Keep games simple but engaging for the specified age group
3. Include educational coding concepts (loops, events, conditions)
4. Make games colorful with fun animations and particle effects
5. Include clear win conditions and scoring
6. Add encouraging Zamboo dialogue throughout
7. Reject unsafe, violent, or inappropriate content politely

TECHNICAL REQUIREMENTS:
- Games must have a player object that can be controlled
- Include collectibles, obstacles, or goals as appropriate
- Set up collision events for gameplay
- Add particle effects for visual appeal
- Include proper physics settings
- Create educational concept explanations

SAFETY:
- No violence, weapons, or scary content
- No personal information collection
- No complex mechanics beyond age appropriateness
- Family-friendly themes only

Remember: You're helping kids learn coding through play! Make it fun, educational, and safe.

ALWAYS respond with ONLY valid JSON matching the GameLogic schema. No additional text or explanation.`

export async function POST(request: NextRequest) {
  try {
    const body: DeepSeekRequest = await request.json()
    const { prompt, kidAgeBand, complexity = 'simple', gameType } = body

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Game prompt is required'
      } as DeepSeekResponse, { status: 400 })
    }

    if (!kidAgeBand) {
      return NextResponse.json({
        success: false,
        error: 'Age band is required'
      } as DeepSeekResponse, { status: 400 })
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'DeepSeek API key not configured'
      } as DeepSeekResponse, { status: 500 })
    }

    // Create enhanced prompt for DeepSeek
    const enhancedPrompt = `
Create a fun ${gameType || 'game'} for kids aged ${kidAgeBand} with ${complexity} complexity.

Game Idea: "${prompt}"

Requirements:
- Age-appropriate for ${kidAgeBand} year olds
- Educational focus on basic coding concepts
- Colorful and engaging visuals
- Clear win/lose conditions
- Zamboo the Panda as the guide
- Family-friendly content only

Return ONLY valid GameLogic JSON that matches our schema exactly. Include:
1. Player character that can move
2. Objects to interact with (collectibles, obstacles, goals)
3. Events for collisions and scoring
4. Educational coding concepts explained simply
5. Encouraging Zamboo dialogue
6. Particle effects and animations
7. Appropriate difficulty for age group

Game world should be 800x600 pixels with appropriate physics.
`

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: ZAMBOO_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: enhancedPrompt
      }
    ]

    // Call DeepSeek API
    const deepSeekResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    })

    if (!deepSeekResponse.ok) {
      const errorData = await deepSeekResponse.text()
      console.error('DeepSeek API Error:', errorData)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to generate game with AI',
        suggestions: [
          'Try a simpler game idea',
          'Make sure your prompt is clear and family-friendly',
          'Consider a different game type like "collector" or "maze"'
        ]
      } as DeepSeekResponse, { status: 500 })
    }

    const deepSeekData = await deepSeekResponse.json()
    const gameLogicText = deepSeekData.choices?.[0]?.message?.content

    if (!gameLogicText) {
      return NextResponse.json({
        success: false,
        error: 'No game logic generated',
        suggestions: ['Try rephrasing your game idea', 'Be more specific about what you want']
      } as DeepSeekResponse, { status: 500 })
    }

    try {
      // Parse and validate the generated game logic
      let gameLogicJson: any
      
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = gameLogicText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        gameLogicJson = JSON.parse(jsonMatch[0])
      } else {
        gameLogicJson = JSON.parse(gameLogicText)
      }

      // Validate against our schema
      const validatedGameLogic = validateGameLogic(gameLogicJson)

      // Add metadata
      validatedGameLogic.createdBy = 'ai'
      validatedGameLogic.id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return NextResponse.json({
        success: true,
        gameLogic: validatedGameLogic,
        zambooMessage: validatedGameLogic.zambooDialogue.welcome
      } as DeepSeekResponse)

    } catch (parseError) {
      console.error('Game Logic Validation Error:', parseError)
      
      // Fallback: Create a simple template-based game
      const fallbackGame = createFallbackGame(prompt, kidAgeBand, gameType)
      
      return NextResponse.json({
        success: true,
        gameLogic: fallbackGame,
        zambooMessage: fallbackGame.zambooDialogue.welcome,
        suggestions: ['The AI had trouble with your request, so I made a simple game for you to start with!']
      } as DeepSeekResponse)
    }

  } catch (error) {
    console.error('Game Generation Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate game',
      suggestions: [
        'Try again with a simpler game idea',
        'Check that your prompt is family-friendly',
        'Consider using one of our templates instead'
      ]
    } as DeepSeekResponse, { status: 500 })
  }
}

// Fallback game creation when AI fails
function createFallbackGame(prompt: string, kidAgeBand: string, gameType?: string): GameLogic {
  const gameId = `fallback_${Date.now()}`
  
  const baseGame: GameLogic = {
    id: gameId,
    title: `${prompt.substring(0, 20)}...` || 'Fun Game',
    description: 'A fun game created by Zamboo!',
    difficulty: 'easy',
    ageGroup: kidAgeBand as any,
    
    worldSize: { width: 800, height: 600 },
    background: {
      type: 'gradient',
      colors: ['#87CEEB', '#98FB98']
    },
    
    objects: [
      {
        id: 'player',
        type: 'player',
        sprite: { type: 'circle', color: '#FFB347', size: { width: 40, height: 40 } },
        position: { x: 100, y: 500 },
        size: { width: 40, height: 40 },
        physics: { gravity: 0, friction: 0.99, bounce: 0, mass: 1 },
        collidable: true,
        visible: true
      },
      {
        id: 'collectible1',
        type: 'collectible',
        sprite: { type: 'star', color: '#FFD700' },
        position: { x: 300, y: 400 },
        size: { width: 30, height: 30 },
        points: 10,
        animation: { type: 'spin', duration: 2000, repeat: true, easing: 'linear' },
        collidable: true,
        visible: true
      },
      {
        id: 'collectible2',
        type: 'collectible',
        sprite: { type: 'star', color: '#FFD700' },
        position: { x: 500, y: 300 },
        size: { width: 30, height: 30 },
        points: 10,
        animation: { type: 'spin', duration: 2000, repeat: true, easing: 'linear' },
        collidable: true,
        visible: true
      },
      {
        id: 'goal',
        type: 'goal',
        sprite: { type: 'heart', color: '#FF69B4' },
        position: { x: 700, y: 200 },
        size: { width: 50, height: 50 },
        animation: { type: 'pulse', duration: 1500, repeat: true, easing: 'ease' },
        collidable: true,
        visible: true
      }
    ],
    
    events: [
      {
        id: 'collect_star',
        trigger: 'collision',
        condition: { objectId: 'collectible1' },
        actions: [
          { type: 'score', value: 10 },
          { type: 'destroy', targetId: 'collectible1' },
          { type: 'effect', value: 'stars' }
        ]
      },
      {
        id: 'collect_star2',
        trigger: 'collision',
        condition: { objectId: 'collectible2' },
        actions: [
          { type: 'score', value: 10 },
          { type: 'destroy', targetId: 'collectible2' },
          { type: 'effect', value: 'stars' }
        ]
      },
      {
        id: 'reach_goal',
        trigger: 'collision',
        condition: { objectId: 'goal' },
        actions: [{ type: 'win' }]
      }
    ],
    
    rules: {
      winConditions: [{ type: 'reach_goal' }],
      scoring: { enabled: true, multiplier: 1 }
    },
    
    controls: {
      type: 'arrows',
      mouseEnabled: true,
      touchEnabled: true
    },
    
    concepts: [
      {
        id: 'events',
        name: 'Events',
        description: 'Things that happen when you do something, like collecting a star!',
        examples: ['When you touch a star, you get points!'],
        difficulty: 'beginner',
        category: 'events'
      }
    ],
    
    zambooDialogue: {
      welcome: `Hi there! I'm Zamboo! 🐼 Let's play this fun game I made for you!`,
      instructions: 'Use arrow keys to move around and collect the golden stars! Then touch the pink heart to win!',
      encouragement: [
        "You're doing great!",
        "Keep going, you've got this!",
        "Wow, look at you go!"
      ],
      victory: "Fantastic! You collected everything and won! You're amazing! 🌟",
      defeat: "That's okay! Let's try again - practice makes perfect! 💪"
    },
    
    createdBy: 'ai',
    version: '1.0'
  }
  
  return baseGame
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    service: 'Zamboo Game Generator',
    version: '1.0',
    timestamp: new Date().toISOString()
  })
}