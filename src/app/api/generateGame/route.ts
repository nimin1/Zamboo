import { NextRequest, NextResponse } from 'next/server'
import { validateGameLogic, GameLogicSchema } from '@/lib/gameLogicSchema'
import { 
  validateGameSpec, 
  repairGameSpec, 
  createDefaultGameSpec,
  getTemplateByComplexity,
  getThemePackByPrompt,
  GameSpecSchema,
  type GameSpec 
} from '@/types/gamespec'
import type { DeepSeekRequest, DeepSeekResponse, GameLogic } from '@/types'

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const ZAMBOO_HTML_GAME_SYSTEM_PROMPT = `You are Zamboo's Game Generator. Create ONE self-contained <html> file with inline <style> and <script> that runs a small playable game in a sandboxed iframe.

Rules:
- No external files, imports, or network calls.
- Render everything on <canvas> using requestAnimationFrame.
- Support keyboard (arrows, space) and touch input.
- Show score, game over, and restart (button or R key). No alerts/prompts.
- Keep code light, kid-friendly, and performant (<100 KB JS).
- Output only the HTML file, nothing else.

🎮 GAME TYPES:
- Collector: Move around and collect items (simple controls)
- Platformer: Jump on platforms, avoid obstacles
- Runner: Auto-scroll, dodge obstacles, collect power-ups
- Maze: Navigate through obstacles to reach goal

🎨 THEMES:
- Space: Stars, rockets, aliens, cosmic backgrounds
- Ocean: Fish, bubbles, coral, underwater scenes  
- Forest: Trees, animals, nature, magical elements
- City: Buildings, cars, urban environments

🏗️ STRUCTURE:
- Canvas-based rendering with smooth animations
- Touch-friendly controls (virtual buttons for mobile)
- Kid-appropriate colors, sounds (beeps), and feedback
- Score display and simple restart mechanism
- Responsive design (works on mobile/desktop)

`

export async function POST(req: NextRequest) {
  try {
    const body: DeepSeekRequest = await req.json()
    const { prompt, kidAgeBand, complexity, gameType } = body

    // Validate required fields
    if (!prompt || !kidAgeBand) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: prompt and kidAgeBand',
        suggestions: [
          'Please provide a game description',
          'Please specify age group (4-6, 7-9, or 10-12)',
        ]
      } as DeepSeekResponse, { status: 400 })
    }

    // Check if DeepSeek API is available
    if (!DEEPSEEK_API_KEY) {
      console.log('🎲 No DeepSeek API key, using GameSpec fallback...')
      
      const gameSpec = createSimplePromptGameSpec(prompt, kidAgeBand)
      const gameLogic = convertGameSpecToLegacyFormat(gameSpec)
      
      return NextResponse.json({
        success: true,
        gameLogic: gameLogic,
        gameSpec: gameSpec,
        zambooMessage: gameSpec.zambooMessages.welcome,
        suggestions: [
          'Your GameSpec game is ready to play!',
          'Try playing and see how you like it!',
          'You can always try a different game idea!'
        ],
        aiGenerated: false,
        fallbackUsed: true
      } as DeepSeekResponse)
    }

    // Create HTML game generation prompt for DeepSeek
    const enhancedPrompt = `User idea: ${prompt}

Create a complete HTML game for kids age ${kidAgeBand}:
- Theme and mechanics based on: "${prompt}"
- Difficulty: ${complexity || 'medium'}
- Kid-friendly colors and simple controls
- Canvas-based with smooth animations
- Score system and restart functionality
- Touch controls for mobile devices

Generate the complete HTML file now:`

2. Theme: Which theme matches?
   - "forest" for nature, animals, magical themes
   - "space" for rockets, stars, aliens, sci-fi
   - "ocean" for underwater, fish, sea themes

3. Educational concepts that fit the game type
4. Kid-friendly Zamboo messages

Return ONLY valid JSON matching the schema exactly.`

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: ZAMBOO_GAMESPEC_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: enhancedPrompt
      }
    ]

    // Debug logging
    console.log('DeepSeek API Key present:', !!DEEPSEEK_API_KEY)
    console.log('DeepSeek API Key length:', DEEPSEEK_API_KEY?.length || 0)
    console.log('API Request body:', JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: 4000,
      temperature: 0.7,
      top_p: 0.9,
    }, null, 2))

    // Call DeepSeek API with 5-minute timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes
    
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
        temperature: 0.3,
        top_p: 0.7,
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    console.log('DeepSeek Response Status:', deepSeekResponse.status)
    console.log('DeepSeek Response Headers:', Object.fromEntries(deepSeekResponse.headers.entries()))

    if (!deepSeekResponse.ok) {
      const errorData = await deepSeekResponse.text()
      console.error('DeepSeek API Error Status:', deepSeekResponse.status)
      console.error('DeepSeek API Error Data:', errorData)
      
      return NextResponse.json({
        success: false,
        error: `Failed to generate game with AI (Status: ${deepSeekResponse.status})`,
        suggestions: [
          'Try a simpler game idea',
          'Make sure your prompt is clear and family-friendly',
          'Consider a different game type like "collector" or "maze"'
        ]
      } as DeepSeekResponse, { status: 500 })
    }

    const deepSeekData = await deepSeekResponse.json()
    const gameSpecText = deepSeekData.choices?.[0]?.message?.content

    if (!gameSpecText) {
      return NextResponse.json({
        success: false,
        error: 'No GameSpec generated',
        suggestions: ['Try rephrasing your game idea', 'Be more specific about what you want']
      } as DeepSeekResponse, { status: 500 })
    }

    console.log('🎮 Raw AI GameSpec Response:', gameSpecText?.substring(0, 500) + '...')
    
    try {
      // 🚀 GAMESPEC JSON EXTRACTION - Handles AI response complexity
      let gameSpecJson: any = null
      let extractionMethod = ''
      
      // Strategy 1: Direct parsing with error tolerance
      try {
        gameSpecJson = JSON.parse(gameSpecText.trim())
        extractionMethod = 'direct'
        console.log('✅ Direct GameSpec JSON parsing successful!')
      } catch (e) {
        console.log('Direct JSON parsing failed, trying advanced extraction methods...')
        
        // Strategy 2: Extract from code blocks
        const codeBlockMatch = gameSpecText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
        if (codeBlockMatch) {
          try {
            gameSpecJson = JSON.parse(codeBlockMatch[1].trim())
            extractionMethod = 'code_block'
            console.log('✅ Code block extraction successful!')
          } catch (e) {
            console.log('Code block extraction failed, trying enhanced extraction...')
          }
        }
        
        // Strategy 3: Enhanced code block extraction (handles nested blocks)
        if (!gameSpecJson) {
          try {
            const jsonStart = gameSpecText.indexOf('{')
            const jsonEnd = gameSpecText.lastIndexOf('}')
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              const potentialJson = gameSpecText.substring(jsonStart, jsonEnd + 1)
              gameSpecJson = JSON.parse(potentialJson)
              extractionMethod = 'enhanced_code_block'
              console.log('✅ Enhanced code block extraction successful!')
            }
          } catch (e) {
            console.log('Enhanced code block extraction failed')
          }
        }
      }

      if (!gameSpecJson) {
        throw new Error('Could not extract valid JSON from AI response')
      }

      console.log('🎮 GameSpec extracted using method:', extractionMethod)
      console.log('🎮 Extracted GameSpec keys:', Object.keys(gameSpecJson))
      console.log('🎮 Sample GameSpec:', JSON.stringify(gameSpecJson, null, 2).substring(0, 800) + '...')

      // 🛠️ GameSpec Smart Repair - Fix and enhance AI-generated specs
      console.log('🔧 GAMESPEC REPAIR: Starting intelligent repair phase...')
      console.log('🔧 Raw GameSpec before repair:', JSON.stringify(gameSpecJson, null, 2))
      
      // Use our intelligent repair function
      const repairedGameSpec = repairGameSpec(gameSpecJson)
      console.log('🔧 Repaired GameSpec:', JSON.stringify(repairedGameSpec, null, 2))

      // 📊 GAMESPEC VALIDATION - Ensure quality and completeness
      console.log('🔍 Starting GameSpec validation...')
      
      const validatedGameSpec = validateGameSpec(repairedGameSpec)
      
      if (!validatedGameSpec) {
        console.log('❌ GameSpec validation failed, creating default spec')
        const defaultSpec = createDefaultGameSpec()
        console.log('🎮 Using default GameSpec:', JSON.stringify(defaultSpec, null, 2))
        
        // Convert to legacy format for backward compatibility
        const legacyGameLogic = convertGameSpecToLegacyFormat(defaultSpec)
        
        return NextResponse.json({
          success: true,
          gameLogic: legacyGameLogic,
          gameSpec: defaultSpec,
          zambooMessage: defaultSpec.zambooMessages.welcome,
          suggestions: [
            'Your default game is ready to play!',
            'Try it out and create a new variation!',
            'AI had trouble with your prompt, but this game is still fun!'
          ],
          aiGenerated: true,
          fallbackUsed: true
        } as DeepSeekResponse)
      }

      console.log('✅ GameSpec validation successful!')
      
      // Convert GameSpec to legacy GameLogic format for compatibility
      const legacyGameLogic = convertGameSpecToLegacyFormat(validatedGameSpec)
      console.log('🔄 Converted to legacy format for backward compatibility')

      // Return the successfully generated GameSpec and legacy format
      return NextResponse.json({
        success: true,
        gameLogic: legacyGameLogic,
        gameSpec: validatedGameSpec,
        zambooMessage: validatedGameSpec.zambooMessages.welcome,
        suggestions: [
          'Your AI GameSpec game is ready to play!',
          'Built with templates and curated assets!',
          'Try it out and generate more games!'
        ],
        aiGenerated: true,
        fallbackUsed: false
      } as DeepSeekResponse)

    } catch (processingError) {
      console.error('❌ AI GameSpec Processing Failed:', processingError)
      console.log('📄 Full AI Response for debugging:')
      console.log('---START AI RESPONSE---')
      console.log(gameSpecText)
      console.log('---END AI RESPONSE---')
      
      // 🚀 GAMESPEC FALLBACK: Create game from prompt using template system
      console.log('🎮 Creating GameSpec-based fallback game...')
      
      const fallbackGameSpec = createSimplePromptGameSpec(prompt, kidAgeBand)
      const fallbackGameLogic = convertGameSpecToLegacyFormat(fallbackGameSpec)
      
      return NextResponse.json({
        success: true,
        gameLogic: fallbackGameLogic,
        gameSpec: fallbackGameSpec,
        zambooMessage: fallbackGameSpec.zambooMessages.welcome,
        suggestions: [
          'Your GameSpec fallback game is ready!',
          'Built with our template system!',
          'Try playing and generate another!'
        ],
        aiGenerated: true,
        fallbackUsed: true
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

// GameSpec-based prompt game creator
function createSimplePromptGameSpec(prompt: string, kidAgeBand: string): GameSpec {
  const template = getTemplateByComplexity(kidAgeBand, 'easy')
  const themePack = getThemePackByPrompt(prompt)
  
  return repairGameSpec({
    title: generateGameTitle(prompt),
    description: generateGameDescription(prompt),
    ageGroup: kidAgeBand as any,
    difficulty: 'easy',
    template,
    themePack,
    codingConcepts: getConceptsForPrompt(prompt),
    winTarget: template === 'top-down-collector' ? 5 : 10
  })
}

// Legacy game creator for backward compatibility
function createSimplePromptGame(prompt: string, kidAgeBand: string): GameLogic {
  const gameId = `simple_${Date.now()}`
  const lower = prompt.toLowerCase()
  
  // Determine game type based on prompt
  let gameType = 'collect'
  let playerType = 'character'
  let collectible = 'star'
  let theme = 'simple'
  
  if (lower.includes('car') || lower.includes('race')) {
    gameType = 'race'
    playerType = 'car'
    collectible = 'boost'
    theme = 'racing'
  } else if (lower.includes('jump') || lower.includes('platform')) {
    gameType = 'jump'
    playerType = 'character'
    collectible = 'coin'
    theme = 'platform'
  } else if (lower.includes('space') || lower.includes('rocket')) {
    gameType = 'collect'
    playerType = 'rocket'
    collectible = 'star'
    theme = 'space'
  } else if (lower.includes('collect')) {
    gameType = 'collect'
    playerType = 'character'
    if (lower.includes('coin')) collectible = 'coin'
    else if (lower.includes('star')) collectible = 'star'
    else if (lower.includes('heart')) collectible = 'heart'
  }
  
  // Simple theme colors
  const getThemeColors = () => {
    switch (theme) {
      case 'racing': return ['#87CEEB', '#90EE90'] // sky blue, light green
      case 'space': return ['#000033', '#9900CC'] // dark blue, purple
      case 'platform': return ['#87CEEB', '#FFE4B5'] // sky blue, moccasin
      default: return ['#87CEEB', '#90EE90'] // default sky and grass
    }
  }
  
  const colors = getThemeColors()
  
  // Simple game title and description
  const getGameInfo = () => {
    if (gameType === 'race') {
      return {
        title: 'Car Racing Game',
        description: 'Race your car to the finish line!'
      }
    } else if (gameType === 'jump') {
      return {
        title: 'Platform Jumping Game', 
        description: 'Jump on platforms and collect coins!'
      }
    } else if (theme === 'space') {
      return {
        title: 'Space Adventure',
        description: 'Collect stars in space!'
      }
    } else {
      return {
        title: 'Collect Game',
        description: 'Collect all the items to win!'
      }
    }
  }
  
  const gameInfo = getGameInfo()
  
  // Create simple game objects
  const objects: any[] = []
  
  // Player object
  objects.push({
    id: 'player',
    type: 'player',
    sprite: {
      type: playerType,
      color: '#4F46E5', // Indigo
      size: { width: 40, height: 40 }
    },
    position: { x: 50, y: 300 },
    size: { width: 40, height: 40 }
  })
  
  // Collectibles
  const collectibleCount = 3
  for (let i = 0; i < collectibleCount; i++) {
    objects.push({
      id: `collectible_${i + 1}`,
      type: 'collectible',
      sprite: {
        type: collectible,
        color: '#F59E0B', // Amber
        size: { width: 30, height: 30 }
      },
      position: {
        x: 200 + i * 200,
        y: 250
      },
      size: { width: 30, height: 30 },
      value: 10
    })
  }
  
  // Goal
  objects.push({
    id: 'goal',
    type: 'goal',
    sprite: {
      type: gameType === 'race' ? 'finish_line' : 'flag',
      color: '#10B981', // Emerald
      size: { width: 50, height: 60 }
    },
    position: { x: 700, y: 280 },
    size: { width: 50, height: 60 }
  })
  
  // Simple events
  const events = [
    {
      id: 'collect_item',
      trigger: 'collision',
      conditions: [{ objectType: 'player' }, { objectType: 'collectible' }],
      actions: [{ type: 'collect', value: 10 }, { type: 'remove_object' }]
    },
    {
      id: 'reach_goal',
      trigger: 'collision',
      conditions: [{ objectType: 'player' }, { objectType: 'goal' }],
      actions: [{ type: 'win_game' }]
    }
  ]
  
  // Simple concepts
  const concepts = [
    {
      id: 'basic_movement',
      name: 'Basic Movement',
      description: 'Learn how to move your character around',
      examples: ['Use arrow keys to move'],
      difficulty: 'beginner' as const,
      category: 'events' as const
    }
  ]
  
  // Simple dialogue
  const dialogue = {
    welcome: `Welcome to ${gameInfo.title}!`,
    instructions: `${gameType === 'race' ? 'Race to the finish line!' : 'Collect all items and reach the goal!'}`,
    encouragement: [
      'Great job!',
      'Keep going!',
      'You\'re doing well!'
    ],
    victory: 'You won! Great job!',
    defeat: 'Try again! You can do it!'
  }
  
  // Create the game
  return {
    id: gameId,
    title: gameInfo.title,
    description: gameInfo.description,
    difficulty: 'easy' as const,
    ageGroup: kidAgeBand as any,
    worldSize: { width: 800, height: 600 },
    background: {
      type: 'gradient' as const,
      colors: colors
    },
    objects: objects,
    events: events,
    rules: {
      winConditions: [{ type: 'collect_all' as const }],
      scoring: { enabled: true }
    },
    controls: { type: 'arrows' as const },
    concepts: concepts,
    zambooDialogue: dialogue,
    createdBy: 'ai' as const,
    version: '1.0'
  }
}

// Helper functions for GameSpec generation
function generateGameTitle(prompt: string): string {
  const lower = prompt.toLowerCase()
  
  if (lower.includes('car') || lower.includes('race')) {
    return 'Racing Adventure'
  } else if (lower.includes('jump') || lower.includes('platform')) {
    return 'Platform Jumper'
  } else if (lower.includes('space') || lower.includes('rocket')) {
    return 'Space Explorer'
  } else if (lower.includes('fish') || lower.includes('ocean')) {
    return 'Ocean Adventure'
  } else if (lower.includes('collect')) {
    return 'Treasure Collector'
  }
  
  return 'Fun Adventure Game'
}

function generateGameDescription(prompt: string): string {
  const title = generateGameTitle(prompt)
  return `An exciting ${title.toLowerCase()} where you explore and have fun!`
}

function getConceptsForPrompt(prompt: string): string[] {
  const lower = prompt.toLowerCase()
  const concepts = ['movement']
  
  if (lower.includes('collect')) concepts.push('loops')
  if (lower.includes('jump') || lower.includes('platform')) concepts.push('conditions')
  if (lower.includes('race') || lower.includes('run')) concepts.push('events')
  if (lower.includes('score')) concepts.push('variables')
  
  return concepts.slice(0, 3) // Max 3 concepts
}

// Convert GameSpec to legacy GameLogic format for backward compatibility
function convertGameSpecToLegacyFormat(gameSpec: GameSpec): GameLogic {
  const gameId = `gamespec_${Date.now()}`
  
  // Create simple game objects based on template
  const objects: any[] = []
  
  // Player object
  objects.push({
    id: 'player',
    type: 'player',
    sprite: {
      type: 'character',
      color: '#4F46E5',
      size: { width: 32, height: 32 }
    },
    position: { x: 50, y: gameSpec.template === 'top-down-collector' ? 300 : 400 },
    size: { width: 32, height: 32 }
  })
  
  // Add collectibles based on win target
  for (let i = 0; i < (gameSpec.winTarget || 5); i++) {
    objects.push({
      id: `collectible_${i + 1}`,
      type: 'collectible',
      sprite: {
        type: gameSpec.themePack === 'space' ? 'star' : gameSpec.themePack === 'ocean' ? 'pearl' : 'coin',
        color: '#F59E0B',
        size: { width: 24, height: 24 }
      },
      position: {
        x: 150 + i * 120,
        y: gameSpec.template === 'top-down-collector' ? 200 + (i % 3) * 100 : 350
      },
      size: { width: 24, height: 24 },
      value: 10
    })
  }
  
  // Goal object
  objects.push({
    id: 'goal',
    type: 'goal',
    sprite: {
      type: 'flag',
      color: '#10B981',
      size: { width: 40, height: 50 }
    },
    position: { x: 700, y: gameSpec.template === 'top-down-collector' ? 300 : 370 },
    size: { width: 40, height: 50 }
  })
  
  // Events
  const events = [
    {
      id: 'collect_item',
      trigger: 'collision',
      conditions: [{ objectType: 'player' }, { objectType: 'collectible' }],
      actions: [{ type: 'collect', value: 10 }, { type: 'remove_object' }]
    },
    {
      id: 'reach_goal',
      trigger: 'collision',
      conditions: [{ objectType: 'player' }, { objectType: 'goal' }],
      actions: [{ type: 'win_game' }]
    }
  ]
  
  // Concepts
  const concepts = gameSpec.codingConcepts.map((concept, index) => ({
    id: `concept_${index}`,
    name: concept.charAt(0).toUpperCase() + concept.slice(1),
    description: `Learn about ${concept} in games`,
    examples: [`Use ${concept} to control game behavior`],
    difficulty: 'beginner' as const,
    category: concept as any
  }))
  
  return {
    id: gameId,
    title: gameSpec.title,
    description: gameSpec.description,
    difficulty: gameSpec.difficulty,
    ageGroup: gameSpec.ageGroup,
    worldSize: { width: 800, height: 600 },
    background: {
      type: 'gradient' as const,
      colors: ['#87CEEB', '#90EE90']
    },
    objects: objects,
    events: events,
    rules: {
      winConditions: [{
        type: gameSpec.winCondition === 'collect-all' ? 'collect_all' as const : 'reach_goal' as const
      }],
      scoring: { enabled: true }
    },
    controls: { type: 'arrows' as const },
    concepts: concepts,
    zambooDialogue: {
      welcome: gameSpec.zambooMessages.welcome,
      instructions: gameSpec.zambooMessages.instructions,
      encouragement: [gameSpec.zambooMessages.encouragement],
      victory: gameSpec.zambooMessages.victory,
      defeat: 'Try again! You can do it!'
    },
    createdBy: 'ai' as const,
    version: '1.0'
  }
}