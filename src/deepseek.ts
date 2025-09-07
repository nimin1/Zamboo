import { GameSpec, validateGameSpec, repairGameSpec, getThemeDefaults, THEME_PALETTES } from './types/gamespec'

export interface DeepSeekGameRequest {
  prompt: string
  kidAgeBand: '4-6' | '7-9' | '10-12'
  complexity?: 'easy' | 'normal' | 'hard'
}

export interface DeepSeekGameResponse {
  success: boolean
  gameSpec?: GameSpec
  error?: string
  suggestions?: string[]
  aiGenerated: boolean
  fallbackUsed: boolean
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

const ZAMBOO_GAMESPEC_PROMPT = `You are Zamboo, an expert game designer for kids! Create amazing games from simple prompts.

🎯 YOUR JOB: Convert kid's speech into a perfect GameSpec JSON that creates fun, polished games.

📋 GAMESPEC SCHEMA (MUST MATCH EXACTLY):
{
  "title": "string (max 50 chars)",
  "theme": "forest|ocean|space|city|desert|snow|candy|farm|castle|underwater|custom", 
  "camera": {
    "type": "side|top|isometric",
    "parallaxLayers": 3
  },
  "palette": {
    "primary": "#RRGGBB", 
    "secondary": "#RRGGBB",
    "accent": "#RRGGBB",
    "bg": "#RRGGBB"
  },
  "player": {
    "sprite": "character_type_name",
    "hitbox": {"w": 32, "h": 32},
    "speed": 280,
    "abilities": ["jump", "dash"],
    "idleAnim": "idle",
    "runAnim": "run", 
    "jumpAnim": "jump"
  },
  "enemies": [
    {
      "name": "enemy_name",
      "sprite": "enemy_type",
      "behavior": "patrol|chase|static",
      "speed": 160,
      "hp": 1
    }
  ],
  "collectibles": [
    {
      "name": "item_name", 
      "sprite": "item_type",
      "value": 10,
      "particle": "sparkle"
    }
  ],
  "level": {
    "segments": 4,
    "length": 3200,
    "platforms": "auto",
    "obstacles": ["spikes"],
    "goal": "collect-N|reach-end|defeat-boss", 
    "goalValue": 50
  },
  "effects": {
    "particles": ["sparkle", "dustMotes"],
    "filters": ["bloom"],
    "weather": "none|snow|floating-leaves|bubbles"
  },
  "audio": {
    "music": "adventure_loop",
    "sfx": {
      "jump": "jump_sound",
      "collect": "collect_sound"
    }
  },
  "controls": {
    "keyboard": true,
    "touch": true
  },
  "difficulty": "easy|normal|hard",
  "ui": {
    "showScore": true,
    "showHealth": false,
    "showTimer": false,
    "tutorial": true
  }
}

🎨 THEME MATCHING RULES:
- "panda/bamboo/forest" → theme: "forest"
- "ocean/water/fish/sea" → theme: "ocean" 
- "space/stars/rocket/alien" → theme: "space"
- "snow/ice/winter" → theme: "snow"
- "candy/sweet/colorful" → theme: "candy"
- "castle/princess/knight" → theme: "castle"
- "underwater/submarine/diving" → theme: "underwater"
- Default: pick the most appropriate theme

🎮 GAME TYPE ANALYSIS:
- "collect/gather" → goal: "collect-N", add collectibles
- "race/run to end" → goal: "reach-end", focus on obstacles
- "jump/platform" → add platforms, jumping abilities
- "avoid/dodge" → add enemies with patrol behavior
- "adventure/explore" → mix of all elements

👾 CHARACTER MATCHING:
- "panda" → player.sprite: "panda"
- "robot" → player.sprite: "robot"  
- "princess" → player.sprite: "princess"
- "car" → player.sprite: "car", theme: "city"
- Default: "character"

🎯 AGE-APPROPRIATE DIFFICULTY:
- 4-6: difficulty: "easy", simple controls, fewer enemies
- 7-9: difficulty: "normal", moderate challenge
- 10-12: difficulty: "hard", more complex mechanics

⚡ VISUAL EFFECTS BY THEME:
- forest: particles: ["leafBurst", "sparkle"], weather: "floating-leaves"
- ocean: particles: ["bubbles", "splash"], weather: "bubbles" 
- space: particles: ["starDust", "nebula"], filters: ["bloom"]
- snow: particles: ["snowflakes"], weather: "snow"

🚨 CRITICAL RULES:
1. ALWAYS return valid JSON matching the schema exactly
2. Use realistic sprite names (panda, robot, star, coin, etc.)
3. Match theme to user's words literally
4. Keep it age-appropriate and fun
5. No violence - enemies just cause "reset" not "death"

EXAMPLES:

Input: "A panda collects glowing bamboo in a sunset forest"
Output: {
  "title": "Panda's Bamboo Adventure",
  "theme": "forest",
  "camera": {"type": "side", "parallaxLayers": 3},
  "palette": {"primary": "#228B22", "secondary": "#8B4513", "accent": "#FFD700", "bg": "#87CEEB"},
  "player": {"sprite": "panda", "hitbox": {"w": 32, "h": 32}, "speed": 280, "abilities": ["jump"], "idleAnim": "idle", "runAnim": "run", "jumpAnim": "jump"},
  "enemies": [],
  "collectibles": [{"name": "bamboo", "sprite": "bamboo", "value": 10, "particle": "sparkle"}],
  "level": {"segments": 4, "length": 3200, "platforms": "auto", "obstacles": [], "goal": "collect-N", "goalValue": 30},
  "effects": {"particles": ["leafBurst", "sparkle"], "filters": ["bloom"], "weather": "floating-leaves"},
  "audio": {"music": "forest_loop", "sfx": {"jump": "jump", "collect": "collect"}},
  "controls": {"keyboard": true, "touch": true},
  "difficulty": "easy",
  "ui": {"showScore": true, "showHealth": false, "showTimer": false, "tutorial": true}
}

RESPOND WITH ONLY THE JSON - NO EXPLANATIONS OR EXTRA TEXT!`

export async function generateGameFromPrompt(request: DeepSeekGameRequest): Promise<DeepSeekGameResponse> {
  try {
    // Check if API key is available
    if (!DEEPSEEK_API_KEY) {
      console.log('🎲 No DeepSeek API key, using smart fallback...')
      return createSmartFallbackGame(request)
    }

    // Create the API request
    const messages = [
      {
        role: 'system' as const,
        content: ZAMBOO_GAMESPEC_PROMPT
      },
      {
        role: 'user' as const,
        content: `Create a GameSpec for: "${request.prompt}" (Age: ${request.kidAgeBand}, Difficulty: ${request.complexity || 'normal'})`
      }
    ]

    console.log('🎮 Calling DeepSeek API for GameSpec generation...')

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 2000,
        temperature: 0.3,
        top_p: 0.8,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const gameSpecText = data.choices?.[0]?.message?.content

    if (!gameSpecText) {
      throw new Error('No GameSpec generated by AI')
    }

    console.log('🎯 AI Response:', gameSpecText.substring(0, 200) + '...')

    // Extract and validate JSON
    const gameSpec = extractGameSpecJSON(gameSpecText)
    
    if (!gameSpec) {
      throw new Error('Could not extract valid JSON from AI response')
    }

    // Validate against schema
    const validation = validateGameSpec(gameSpec)
    
    if (!validation) {
      console.error('❌ GameSpec validation failed')
      throw new Error(`Invalid GameSpec`)
    }

    console.log('✅ GameSpec generated and validated successfully!')

    return {
      success: true,
      gameSpec: validation,
      aiGenerated: true,
      fallbackUsed: false,
      suggestions: [
        'Your AI-generated game is ready!',
        'Try it out and have fun!',
        'You can create more games with different prompts!'
      ]
    }

  } catch (error) {
    console.error('💥 GameSpec generation failed:', error)
    
    // Use smart fallback
    console.log('🔄 Using smart fallback game generator...')
    return createSmartFallbackGame(request)
  }
}

function extractGameSpecJSON(text: string): any {
  try {
    // Try direct parsing first
    return JSON.parse(text.trim())
  } catch {
    // Try extracting from code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim())
      } catch {}
    }
    
    // Try extracting JSON object from text
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        return JSON.parse(text.substring(jsonStart, jsonEnd + 1))
      } catch {}
    }
    
    return null
  }
}

function createSmartFallbackGame(request: DeepSeekGameRequest): DeepSeekGameResponse {
  console.log('🧠 Creating smart fallback game for:', request.prompt)
  
  const prompt = request.prompt.toLowerCase()
  
  // Smart theme detection
  let theme: GameSpec['theme'] = 'forest' // default
  if (prompt.includes('panda') || prompt.includes('bamboo') || prompt.includes('forest')) theme = 'forest'
  else if (prompt.includes('ocean') || prompt.includes('water') || prompt.includes('fish') || prompt.includes('sea')) theme = 'ocean'
  else if (prompt.includes('space') || prompt.includes('star') || prompt.includes('rocket') || prompt.includes('alien')) theme = 'space'
  else if (prompt.includes('snow') || prompt.includes('ice') || prompt.includes('winter')) theme = 'snow'
  else if (prompt.includes('candy') || prompt.includes('sweet') || prompt.includes('colorful')) theme = 'candy'
  else if (prompt.includes('castle') || prompt.includes('princess') || prompt.includes('knight')) theme = 'castle'
  else if (prompt.includes('underwater') || prompt.includes('submarine')) theme = 'underwater'
  else if (prompt.includes('city') || prompt.includes('car') || prompt.includes('building')) theme = 'city'
  else if (prompt.includes('desert') || prompt.includes('sand')) theme = 'desert'
  else if (prompt.includes('farm') || prompt.includes('barn') || prompt.includes('cow')) theme = 'farm'

  // Smart player detection
  let playerSprite = 'character'
  if (prompt.includes('panda')) playerSprite = 'panda'
  else if (prompt.includes('robot')) playerSprite = 'robot'
  else if (prompt.includes('princess')) playerSprite = 'princess'
  else if (prompt.includes('car')) playerSprite = 'car'
  else if (prompt.includes('rocket')) playerSprite = 'rocket'

  // Smart collectible detection
  let collectibles: GameSpec['collectibles'] = []
  if (prompt.includes('bamboo')) {
    collectibles.push({ name: 'bamboo', sprite: 'bamboo', value: 10, particle: 'sparkle' })
  } else if (prompt.includes('star')) {
    collectibles.push({ name: 'star', sprite: 'star', value: 15, particle: 'sparkle' })
  } else if (prompt.includes('coin')) {
    collectibles.push({ name: 'coin', sprite: 'coin', value: 20, particle: 'sparkle' })
  } else if (prompt.includes('gem')) {
    collectibles.push({ name: 'gem', sprite: 'gem', value: 25, particle: 'sparkle' })
  } else {
    // Default collectible based on theme
    switch (theme) {
      case 'forest': collectibles.push({ name: 'acorn', sprite: 'acorn', value: 10, particle: 'sparkle' }); break
      case 'ocean': collectibles.push({ name: 'shell', sprite: 'shell', value: 12, particle: 'bubbles' }); break
      case 'space': collectibles.push({ name: 'crystal', sprite: 'crystal', value: 15, particle: 'starDust' }); break
      default: collectibles.push({ name: 'star', sprite: 'star', value: 10, particle: 'sparkle' })
    }
  }

  // Smart difficulty mapping
  const difficultyMap = {
    '4-6': 'easy' as const,
    '7-9': 'medium' as const,
    '10-12': 'hard' as const
  }

  // Smart goal detection
  let goal: GameSpec['level']['goal'] = 'collect-N'
  let goalValue = 20
  
  if (prompt.includes('race') || prompt.includes('finish') || prompt.includes('end')) {
    goal = 'reach-end'
    goalValue = 1
  } else if (prompt.includes('boss') || prompt.includes('defeat')) {
    goal = 'defeat-boss'
    goalValue = 1
  }

  // Create the GameSpec with smart defaults using repairGameSpec
  const gameSpec = repairGameSpec({
    title: generateGameTitle(request.prompt),
    description: `A fun ${theme}-themed adventure game created just for you!`,
    ageGroup: request.kidAgeBand,
    difficulty: difficultyMap[request.kidAgeBand],
    template: 'platformer' as const,
    themePack: theme === 'forest' ? 'forest' : 'space',
    theme,
    camera: {
      type: 'side',
      parallaxLayers: 3
    },
    palette: THEME_PALETTES[theme],
    player: {
      sprite: playerSprite,
      hitbox: { w: 32, h: 32 },
      speed: request.kidAgeBand === '4-6' ? 240 : request.kidAgeBand === '7-9' ? 280 : 320,
      abilities: ['jump'],
      idleAnim: 'idle',
      runAnim: 'run',
      jumpAnim: 'jump'
    },
    enemies: generateSmartEnemies(theme, request.kidAgeBand),
    collectibles,
    level: {
      segments: request.kidAgeBand === '4-6' ? 3 : request.kidAgeBand === '7-9' ? 4 : 5,
      length: 2400 + (request.kidAgeBand === '10-12' ? 800 : 0),
      platforms: 'auto',
      obstacles: generateSmartObstacles(theme),
      goal,
      goalValue
    },
    effects: getThemeDefaults(theme).effects!,
    audio: {
      music: `${theme}_loop`,
      sfx: {
        jump: 'jump',
        collect: 'collect',
        hurt: 'hurt',
        victory: 'victory'
      }
    },
    controls: {
      keyboard: true,
      touch: true,
      gamepad: false
    },
    ui: {
      showScore: true,
      showHealth: request.kidAgeBand !== '4-6',
      showTimer: false,
      tutorial: true
    }
  })

  return {
    success: true,
    gameSpec,
    aiGenerated: false,
    fallbackUsed: true,
    suggestions: [
      'Created a smart game based on your prompt!',
      'The game adapts to your theme and age group',
      'Try it out and create more games!'
    ]
  }
}

function generateGameTitle(prompt: string): string {
  const words = prompt.split(' ').filter(w => w.length > 2)
  const title = words.slice(0, 4).join(' ')
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function generateSmartEnemies(theme: GameSpec['theme'], ageBand: string): GameSpec['enemies'] {
  if (ageBand === '4-6') return [] // No enemies for youngest kids
  
  const enemyCount = ageBand === '7-9' ? 1 : 2
  const enemies: GameSpec['enemies'] = []
  
  for (let i = 0; i < enemyCount; i++) {
    let enemyType = 'blob'
    switch (theme) {
      case 'forest': enemyType = 'spider'; break
      case 'ocean': enemyType = 'jellyfish'; break
      case 'space': enemyType = 'asteroid'; break
      case 'snow': enemyType = 'snowball'; break
      case 'candy': enemyType = 'sourball'; break
      case 'castle': enemyType = 'ghost'; break
    }
    
    enemies.push({
      name: `${enemyType}_${i + 1}`,
      sprite: enemyType,
      behavior: 'patrol',
      speed: 120 + (i * 20),
      hp: 1
    })
  }
  
  return enemies
}

function generateSmartObstacles(theme: GameSpec['theme']): string[] {
  switch (theme) {
    case 'forest': return ['thorns', 'branches']
    case 'ocean': return ['coral', 'currents'] 
    case 'space': return ['meteors', 'blackholes']
    case 'snow': return ['icicles', 'avalanche']
    case 'candy': return ['sticky', 'sour']
    case 'castle': return ['spikes', 'moats']
    default: return ['spikes']
  }
}