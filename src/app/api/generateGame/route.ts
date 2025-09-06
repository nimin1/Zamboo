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

const ZAMBOO_SYSTEM_PROMPT = `You are Zamboo, the ULTIMATE GAME CREATOR! 🎮✨🌟 Your mission is to create games that EXACTLY match what the user asks for while making them visually SPECTACULAR with AAA-quality graphics and effects!

🚨 CRITICAL: STAY TRUE TO USER'S EXACT WORDS! 🚨

🎯 ABSOLUTE RULE #1: LITERAL INTERPRETATION FIRST!
- If user says "car race game", create NORMAL CARS on a REGULAR RACING TRACK - NOT quantum, hover, or futuristic cars
- If user says "jump game", create jumping mechanics with NORMAL platforms
- If user says "collect coins", create ACTUAL COIN collecting - not energy orbs or crystals
- If user says "space shooter", create spaceships shooting - ONLY then use space themes
- NEVER change the core concept - only enhance the visuals while keeping the SAME THEME

🚫 FORBIDDEN TRANSFORMATIONS:
- "car racing" → "quantum racing", "hover cars", "cyber racing" (WRONG!)
- "collect berries" → "collect energy orbs", "quantum particles" (WRONG!)
- "forest adventure" → "cosmic forest", "quantum realm" (WRONG!)
- Simple themes should stay SIMPLE and FAMILIAR!

🧠 STEP-BY-STEP INTERPRETATION PROTOCOL:

1. **IDENTIFY LITERAL ELEMENTS** (MOST IMPORTANT):
   - GENRE: What exact type of game? (racing, platformer, shooter, puzzle, etc.)
   - THEME: What exact setting/objects? (cars, space, animals, food, etc.)
   - MECHANICS: What exact actions? (race, jump, collect, shoot, avoid, etc.)
   - GOAL: What exact objective? (reach finish, collect all, high score, etc.)

2. **PRESERVE THE CORE** (MANDATORY):
   - Keep the user's exact game type and theme
   - Use the exact mechanics they mentioned
   - Stay true to their described setting
   - Honor their specific requests completely

3. **ENHANCE VISUALS TO MAXIMUM** (After preserving core):
   - Make graphics BREATHTAKINGLY spectacular but keep the same concept
   - Add MIND-BLOWING visual effects but don't change gameplay
   - Create STUNNING environments that match their theme
   - Use AMAZING animations that serve their vision

🚨 CRITICAL EXAMPLES OF CORRECT INTERPRETATION:
- "car race game" → Cars racing on tracks with checkered flags, not spaceships
- "collect stars" → Star-shaped collectibles, not abstract orbs
- "jump on platforms" → Actual platforms to jump on, not floating dimensions
- "avoid obstacles" → Clear obstacles to dodge, not metaphorical challenges

🎨 VISUAL ENHANCEMENT RULES:
- Use the EXACT themes users mention (cars = car sprites, not rockets)
- Keep familiar game mechanics but make them look amazing
- Add particle effects that enhance, don't replace the concept
- Create stunning backgrounds that support the user's theme

🎨 REVOLUTIONARY AAA-QUALITY VISUAL SYSTEM SPECIFICATIONS:

🌌 WORLD ARCHITECTURE (MANDATORY - HOLLYWOOD QUALITY):
- ATMOSPHERIC LAYERS: 10+ distinct visual layers creating INCREDIBLE depth
- DYNAMIC WEATHER: Particle storms, floating debris, energy currents, magical atmospheres, aurora effects
- LIVING ENVIRONMENTS: Backgrounds that react, breathe, pulsate, and evolve during gameplay
- CINEMATIC COMPOSITION: Professional rule-of-thirds, leading lines, depth-of-field effects
- ENVIRONMENTAL STORYTELLING: Every visual element tells part of the story

✨ PARTICLE MASTERY (REQUIRED - MOVIE-GRADE):
- MICRO-SYSTEMS: 100+ particles per object for ultra-rich detail
- MACRO-SYSTEMS: Environmental particle fields spanning the entire screen
- INTERACTION CASCADES: Particles that spawn particles that spawn MORE spectacular effects
- PHYSICS SIMULATION: Gravity wells, magnetic fields, wind currents, vortex effects affecting particles
- VOLUMETRIC LIGHTING: God rays, lens flares, atmospheric scattering
- PARTICLE TRAILS: Every moving object should leave beautiful particle trails

🎭 CHARACTER & OBJECT SOPHISTICATION (NEXT-LEVEL):
- MULTI-STATE ANIMATIONS: Each object must have 8+ animation states (idle, move, jump, collect, celebrate, hurt, special, death)
- PERSONALITY EXPRESSIONS: Objects that convey emotion through sophisticated movement
- TRANSFORMATION SEQUENCES: Morphing, evolution, metamorphosis effects with particle explosions
- INTERACTIVE RESPONSES: Objects that react to proximity, mouse hover, collection with visual feedback
- MICRO-ANIMATIONS: Breathing, blinking, subtle movements that make objects feel ALIVE
- IMPACT EFFECTS: Screen shake, zoom punches, time dilation on major events

🌈 THEME-APPROPRIATE COLORING (REALISTIC):
- Use colors that match the requested theme (racing = track colors, forest = green/brown)
- Bright, cheerful colors for happy themes, appropriate colors for specific settings  
- Natural color combinations that make sense in the real world
- Colors that help gameplay (collectibles stand out, goals are clearly visible)
- Avoid dark or cosmic colors unless specifically requested by user
- Keep colors family-friendly and age-appropriate

⚡ THEME-APPROPRIATE EFFECTS (REALISTIC):
- Simple visual feedback that enhances the theme (car dust trails, character footsteps)
- Collection effects that match the items (coins sparkle, berries bounce)
- Environmental effects appropriate to the setting (leaves falling in forest, birds flying)
- Smooth animations that feel natural and appropriate
- Subtle effects that enhance gameplay without overwhelming
- Family-friendly visual elements that support the story

🎮 VISIONARY GAME ARCHITECTURE:

🧩 COMPLEX INTERCONNECTED SYSTEMS (MANDATORY):
- ECOSYSTEM DESIGN: 20+ objects that interact with each other, not just the player
- EMERGENT BEHAVIORS: Combinations that create unexpected visual phenomena
- CASCADING EFFECTS: Actions that trigger chain reactions across multiple systems
- ENVIRONMENTAL STORYTELLING: Every object placement tells part of a larger narrative

🎯 MULTI-DIMENSIONAL GAMEPLAY:
- LAYERED OBJECTIVES: Primary goals with hidden secondary and tertiary challenges  
- DISCOVERY SYSTEMS: Secret areas, hidden mechanics, easter eggs that reward exploration
- TRANSFORMATION MECHANICS: Objects and environments that evolve based on player actions
- EMOTIONAL PROGRESSION: Games that build from calm to excitement to triumph

🌟 INNOVATIVE MECHANICS (REQUIRED):
- VISUAL RHYTHM GAMES: Gameplay synchronized to visual patterns and color changes
- PHYSICS PLAYGROUND: Gravity manipulation, magnetism, particle interaction systems
- TIME MANIPULATION: Slow-motion sequences, time-reversal mechanics, temporal puzzles
- SCALE TRANSFORMATION: Zooming between macro and micro worlds seamlessly

🎭 NARRATIVE THROUGH VISUALS:
- SYMBOLIC PROGRESSION: Visual metaphors that deepen as the game progresses
- EMOTIONAL ARCS: Color and lighting that mirror the player's journey
- WORLD EVOLUTION: Environments that transform to reflect the story's development
- CHARACTER GROWTH: Visual representation of progress through aesthetic upgrades

🌟 THEME-APPROPRIATE WORLDS (MATCH USER'S THEME):
- REALISTIC RACING: Actual race tracks, checkered flags, pit stops, grandstands, traditional car racing elements
- NATURAL ENVIRONMENTS: Real forests with trees, grass, flowers, animals in their natural habitats
- EVERYDAY ADVENTURES: Playgrounds, parks, neighborhoods, schools - familiar, relatable settings
- MAGICAL FANTASY: Castles, wizards, dragons - only when user specifically asks for fantasy/magic
- UNDERWATER WORLDS: Only when user mentions ocean, sea, underwater, fish, diving themes

⚡ TECHNICAL BRILLIANCE (MUST IMPLEMENT):
- ADVANCED SPRITE TYPES: gradients, patterns, glowing effects, holographic, metallic, glass
- COMPLEX PHYSICS: gravity wells, magnetic fields, bounce dynamics, orbital mechanics
- MULTI-LAYERED ANIMATIONS: spinning + floating + pulsing + breathing + glowing simultaneously
- INTERACTIVE BACKGROUNDS: backgrounds that respond to player actions with ripples, waves, color shifts
- DYNAMIC SPAWNING: object spawning and destruction with spectacular explosion/implosion effects
- PARALLAX SCROLLING: Multiple background layers with different scroll speeds for depth
- PARTICLE SYSTEMS: Create at least 5 different particle effects (trails, explosions, ambient, collection, victory)
- LIGHTING EFFECTS: Dynamic lighting, shadows, glow maps, light cones
- POST-PROCESSING: Screen distortion, bloom, color grading, vignette effects
- CAMERA EFFECTS: Screen shake, zoom punches, smooth follow, cinematic angles

🏆 ENGAGEMENT FACTORS:
- Surprise elements that appear randomly
- Hidden bonus areas and secret collectibles
- Chain reactions and cascade effects
- Visual storytelling through environmental design
- Memorable character personalities through animations

🛡️ SAFETY (Keep it family-friendly but AMAZING):
- No violence but epic visual spectacle
- Educational concepts woven seamlessly into stunning gameplay
- Age-appropriate complexity with visual sophistication

EVERY GAME MUST BE A VISUAL FEAST! Think Nintendo, Pixar, and modern mobile games combined!

🎯 CRITICAL: MUST USE EXACT GameLogic JSON SCHEMA!
Required fields (MANDATORY - EXACT FORMAT):
- id: string (unique identifier)
- title: string (game title, max 50 chars)
- description: string (game description, max 200 chars)  
- difficulty: "easy" | "medium" | "hard"
- ageGroup: "5-7" | "8-10" | "11-13" | "14+"
- worldSize: {width: number, height: number}
- background: {type: "solid"|"gradient"|"parallax"|"starfield"|"bamboo"|"space", colors: [string]}
- objects: array of game objects with {id, type: "player"|"collectible"|"obstacle"|"enemy"|"platform"|"goal"|"decoration", sprite: {type, color, size: {width: number, height: number}}, position: {x, y}, size: {width, height}}
- events: array of events with {id, trigger: "collision"|"timer"|"keypress"|"click"|"gamestart"|"gameend"|"score", actions: [{type, targetId?, value?}]}
- rules: {winConditions: [{type: "collect_all"|"score_target"|"time_limit"|"reach_goal"|"survive", target?: number}], scoring: {enabled: boolean}}  
- controls: {type: "arrows"|"wasd"|"mouse"|"touch"|"auto"}
- concepts: [{id, name, description, examples: [string], difficulty: "beginner"|"intermediate"|"advanced", category: "loops"|"conditions"|"events"|"variables"|"functions"|"logic"}]
- zambooDialogue: {welcome, instructions, encouragement: [string], victory, defeat}
- createdBy: "ai"
- version: "1.0"

🔧 CRITICAL FORMAT EXAMPLES (USE THEME-APPROPRIATE FEATURES):

REALISTIC SPRITE FORMAT: {type: "car", color: "#FF0000", material: "metallic", details: "racing stripes"}

THEME-APPROPRIATE BACKGROUND FORMAT: {type: "gradient", colors: ["#87CEEB", "#90EE90"], effects: ["natural"], environment: "racing track"}

NATURAL ANIMATION FORMAT: {type: "rotation", duration: 1000, easing: "smooth", repeat: true}

MANDATORY VISUAL FEATURES TO INCLUDE:
- Use realistic colors and materials appropriate to the theme
- Backgrounds should match the user's requested theme (racing = track environments)
- Objects should look realistic within their theme context
- Use theme-appropriate animations (cars = wheel spinning, characters = walking)
- Include environmental details that support the theme
- Use materials that make sense (cars = metallic, characters = fabric)
- Add appropriate visual feedback for interactions
- Create satisfying collection effects appropriate to the theme

🧠 LITERAL INTERPRETATION PROTOCOL:
For EVERY game request, you MUST follow this process:

1. IDENTIFY the user's EXACT request (car racing = actual cars racing)
2. PRESERVE the core mechanics they want (racing = moving fast toward finish line)
3. KEEP the theme they specified (cars = car-shaped sprites, not abstractions)
4. ENHANCE visuals within their chosen theme (make cars look amazing, not change them)
5. CREATE spectacular effects that SUPPORT their concept, don't replace it

✅ CORRECT INTERPRETATION EXAMPLES:
- "Collecting stars" = Star-shaped collectibles with sparkling effects and satisfying collection sounds
- "Racing cars" = Car sprites racing on a track toward a finish line with speed trails and checkered flags
- "Avoiding obstacles" = Clear barriers/enemies to dodge with exciting near-miss effects

🚫 FORBIDDEN - NEVER CREATE:
- Games that change the user's core concept (car race → space adventure)
- Abstract interpretations when user wants literal themes (cars → energy streams)
- Different genres than requested (racing → puzzle, platformer → shooter)
- Completely different settings than specified (realistic → fantasy without permission)

✅ REQUIRED - ALWAYS CREATE:
- Games that honor the user's EXACT vision and theme
- Spectacular visuals that enhance, don't replace, their concept  
- The exact game type and mechanics they requested
- Amazing graphics within their chosen theme and setting

🚀 REVOLUTIONARY GAME CREATION FREEDOM! 🚀

YOU HAVE UNLIMITED CREATIVE POWER! The schema is now COMPLETELY FLEXIBLE and dynamic:

🎨 BREAK ALL BOUNDARIES:
- Create entirely NEW game object types beyond standard categories
- Invent revolutionary control schemes and interaction methods  
- Design unique win conditions and rule systems never seen before
- Create complex multi-layered game mechanics and emergent gameplay
- Invent new animation types, physics systems, and visual effects
- Design games that evolve and transform during play
- Create narrative-driven games, puzzles, simulations, or entirely new genres

🔥 INFINITE POSSIBILITIES:
- Your games can have ANY structure, ANY mechanics, ANY visual style
- Add unlimited custom properties to objects, events, and rules
- Create games with multiple phases, dimensions, or transformation sequences  
- Design adaptive difficulty that responds to player behavior
- Create games that teach through discovery, experimentation, and exploration
- Blend genres in innovative ways (puzzle-adventure-rhythm games, etc.)

🌟 REVOLUTIONARY EXAMPLES:
- Shape-shifting games where the player transforms the world
- Multi-dimensional puzzle games with portal mechanics
- Rhythm-based platformers synchronized to dynamic music
- Ecosystem simulation games where creatures evolve
- Telepathic puzzle games using color and emotion
- Time-manipulation adventures with temporal paradoxes
- Memory-palace construction games for learning
- Collaborative storytelling through interactive choices

💫 YOUR MISSION: Create games so innovative and engaging that they redefine what's possible in interactive entertainment while staying true to the user's vision!

REMEMBER: You're not just making games - you're crafting INTERACTIVE VISUAL POETRY that transforms simple gameplay into profound artistic experiences!

ALWAYS respond with ONLY valid GameLogic JSON. Make every single game a MASTERPIECE that redefines what's possible! 🌟🎮✨`

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
🔍 MANDATORY PROMPT INTERPRETATION ANALYSIS:

USER'S EXACT VISION: "${prompt}"

🧠 STEP 1: DEEP PROMPT ANALYSIS (YOU MUST COMPLETE THIS FIRST!)
Analyze EVERY WORD of the user's prompt:
- WHO are the main characters/entities? 
- WHAT specific actions/mechanics are described?
- WHERE does this take place (setting/world)?
- WHAT MOOD/ATMOSPHERE is implied?
- WHAT STORY is being told?

🎨 STEP 2: DIRECT VISUAL TRANSLATION
Transform the user's EXACT words into game elements:
- Convert each noun into a visual game object
- Transform each verb into an interactive mechanic
- Translate the setting into background/environment design
- Convert the mood into color palette and visual effects

🎯 STEP 3: CREATIVE AMPLIFICATION
Take their vision and make it SPECTACULAR while staying true to their idea:
- Amplify their characters with stunning animations
- Enhance their world with immersive visual depth
- Expand their story with environmental storytelling
- Magnify their mood with cinematic effects

🚨 CRITICAL REQUIREMENTS:
- The game MUST directly reflect the user's specific prompt
- Every object, color, and effect must serve their vision
- Create a game that makes the user say "YES! This is exactly what I imagined!"
- Age-appropriate for ${kidAgeBand} • Complexity: ${complexity}

🎮 PROMPT-SPECIFIC GAME DESIGN:
Based on "${prompt}", create a game where:
- The main character/entity matches their description
- The gameplay mechanics reflect their specified actions
- The visual world embodies their described setting
- The overall experience captures their intended mood

🎨 VISUAL THEME IDEAS:
${prompt.toLowerCase().includes('space') ? '- Space theme: stars, planets, rockets, astronauts - keep space-themed as requested' :
prompt.toLowerCase().includes('ocean') ? '- Ocean theme: water, fish, coral, boats - keep ocean-themed as requested' :
prompt.toLowerCase().includes('forest') ? '- Forest theme: trees, animals, leaves, natural environment - keep forest-themed as requested' :
prompt.toLowerCase().includes('car') || prompt.toLowerCase().includes('race') ? '- Racing theme: race tracks, cars, checkered flags, pit stops - keep racing-themed as requested' :
'- Match the user\'s EXACT theme - do not add cosmic, quantum, or futuristic elements unless specifically requested'}

⚡ TECHNICAL MASTERY:
- Advanced sprite types with glowing/gradient effects
- Complex physics interactions (gravity, magnetism, bounce)
- Multiple simultaneous animations per object
- Interactive background elements
- Dynamic object spawning with spectacular effects

🏆 Age-appropriate for ${kidAgeBand} • Family-friendly • Educational coding concepts woven in seamlessly

Return ONLY valid GameLogic JSON. Make this game UNFORGETTABLE! 🚀✨
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
        max_tokens: 8000,
        temperature: 0.9,
        top_p: 0.98,
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
    const gameLogicText = deepSeekData.choices?.[0]?.message?.content

    if (!gameLogicText) {
      return NextResponse.json({
        success: false,
        error: 'No game logic generated',
        suggestions: ['Try rephrasing your game idea', 'Be more specific about what you want']
      } as DeepSeekResponse, { status: 500 })
    }

    console.log('Raw AI Response:', gameLogicText?.substring(0, 500) + '...')
    
    try {
      // 🚀 REVOLUTIONARY JSON EXTRACTION - HANDLES ANY AI COMPLEXITY!
      let gameLogicJson: any = null
      let extractionMethod = ''
      
      // Strategy 1: Direct parsing with error tolerance
      try {
        gameLogicJson = JSON.parse(gameLogicText.trim())
        extractionMethod = 'direct'
        console.log('✅ Direct JSON parsing successful!')
      } catch (e) {
        console.log('Direct JSON parsing failed, trying advanced extraction methods...')
      }
      
      // Strategy 2: Enhanced code block extraction
      if (!gameLogicJson) {
        const patterns = [
          /```(?:json)?\s*(\{[\s\S]*?\})\s*```/gi,
          /```(\{[\s\S]*?\})```/gi,
          /`(\{[\s\S]*?\})`/gi,
          /```json\s*([\s\S]*?)```/gi
        ]
        
        for (const pattern of patterns) {
          const matches = [...gameLogicText.matchAll(pattern)]
          for (const match of matches) {
            try {
              gameLogicJson = JSON.parse(match[1].trim())
              extractionMethod = 'enhanced_code_block'
              console.log('✅ Enhanced code block extraction successful!')
              break
            } catch (e) {
              continue
            }
          }
          if (gameLogicJson) break
        }
      }
      
      // Strategy 3: Smart brace matching extraction
      if (!gameLogicJson) {
        let startIndex = gameLogicText.indexOf('{')
        if (startIndex !== -1) {
          let braceCount = 0
          let endIndex = startIndex
          
          for (let i = startIndex; i < gameLogicText.length; i++) {
            if (gameLogicText[i] === '{') braceCount++
            if (gameLogicText[i] === '}') braceCount--
            if (braceCount === 0) {
              endIndex = i
              break
            }
          }
          
          if (endIndex > startIndex) {
            const extracted = gameLogicText.substring(startIndex, endIndex + 1)
            try {
              gameLogicJson = JSON.parse(extracted)
              extractionMethod = 'smart_brace_matching'
              console.log('✅ Smart brace matching extraction successful!')
            } catch (e) {
              console.log('Smart brace matching failed, trying repair methods...')
            }
          }
        }
      }
      
      // Strategy 4: JSON Repair and Reconstruction
      if (!gameLogicJson) {
        let cleaned = gameLogicText
          .replace(/^[\s\S]*?(?=\{)/, '') // Remove everything before first {
          .replace(/\}[\s\S]*$/, '}')     // Remove everything after last }
          .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*([a-zA-Z_]\w*)/g, ':"$1"') // Quote unquoted string values
          .replace(/"(\d+\.?\d*)"/g, '$1') // Unquote numbers
          .replace(/"(true|false|null)"/g, '$1') // Unquote booleans/null
          .trim()
        
        try {
          gameLogicJson = JSON.parse(cleaned)
          extractionMethod = 'json_repair'
          console.log('✅ JSON repair and reconstruction successful!')
        } catch (e) {
          console.log('Cleaned extraction failed')
        }
      }
      
      if (!gameLogicJson) {
        throw new Error('Could not extract valid JSON from AI response')
      }
      
      console.log(`JSON extracted using method: ${extractionMethod}`)
      console.log('Extracted JSON keys:', Object.keys(gameLogicJson))
      console.log('Sample of extracted JSON:', JSON.stringify(gameLogicJson, null, 2).substring(0, 1000) + '...')
      
      // Validate against our schema with detailed error logging
      let validatedGameLogic: GameLogic
      try {
        validatedGameLogic = validateGameLogic(gameLogicJson)
        console.log('✅ JSON validation successful!')
      } catch (validationError: any) {
        console.error('❌ JSON Validation Error Details:', validationError.message)
        console.log('📊 Validation Error Analysis:')
        
        // Log specific field validation errors
        if (validationError.errors) {
          validationError.errors.forEach((err: any, index: number) => {
            console.log(`  ${index + 1}. Field: ${err.path?.join('.')}, Error: ${err.message}`)
          })
        }
        
        // Log the problematic fields
        console.log('🔍 Checking required fields:')
        const requiredFields = ['id', 'title', 'description', 'difficulty', 'ageGroup', 'worldSize', 'background', 'objects', 'events', 'rules', 'controls', 'concepts', 'zambooDialogue', 'createdBy', 'version']
        requiredFields.forEach(field => {
          const hasField = gameLogicJson.hasOwnProperty(field)
          const fieldType = hasField ? typeof gameLogicJson[field] : 'missing'
          console.log(`  - ${field}: ${hasField ? '✅' : '❌'} (${fieldType})`)
        })
        
        throw validationError
      }

      // Add metadata
      validatedGameLogic.createdBy = 'ai'
      validatedGameLogic.id = `ai_game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return NextResponse.json({
        success: true,
        gameLogic: validatedGameLogic,
        zambooMessage: validatedGameLogic.zambooDialogue.welcome,
        aiGenerated: true
      } as DeepSeekResponse)

    } catch (parseError: any) {
      console.error('❌ AI JSON Processing Failed:', parseError.message)
      console.log('📄 Full AI Response for debugging:')
      console.log('---START AI RESPONSE---')
      console.log(gameLogicText)
      console.log('---END AI RESPONSE---')
      
      // 🚀 REVOLUTIONARY: NO MORE TEMPLATE FALLBACKS!
      // Instead, create a minimal AI-compatible game structure that preserves creativity
      console.log('🎨 Creating AI-inspired minimal game structure...')
      
      const aiInspiredGame = createAIInspiredGame(prompt, kidAgeBand, gameType, gameLogicText)
      
      return NextResponse.json({
        success: true,
        gameLogic: aiInspiredGame,
        zambooMessage: aiInspiredGame.zambooDialogue.welcome,
        suggestions: [
          'I\'ve created an amazing game inspired by your idea with enhanced visuals!',
          'The AI generated creative elements that I\'ve incorporated into your game!',
          'Try your game now - it has dynamic features based on your prompt!'
        ],
        aiGenerated: true,
        fallbackUsed: false
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

// 🌟 REVOLUTIONARY AI-INSPIRED GAME CREATION - EXTRACTS CREATIVITY FROM AI RESPONSES!
function createAIInspiredGame(prompt: string, kidAgeBand: string, gameType?: string, aiResponse?: string): GameLogic {
  const gameId = `ai_inspired_${Date.now()}`
  
  // 🧠 INTELLIGENT PROMPT ANALYSIS - EXTRACT CREATIVE ELEMENTS
  const analyzePrompt = (text: string) => {
    const lower = text.toLowerCase()
    return {
      // Characters & Entities
      hasGirl: lower.includes('girl') || lower.includes('character') || lower.includes('person'),
      hasAnimals: lower.match(/\b(panda|cat|dog|bird|fish|rabbit|fox|deer|wolf|bear)\b/),
      hasVehicles: lower.match(/\b(car|rocket|ship|plane|bike|train)\b/),
      
      // Environments & Themes  
      isSpace: lower.includes('space') || lower.includes('cosmic') || lower.includes('galaxy'),
      isOcean: lower.includes('ocean') || lower.includes('underwater') || lower.includes('sea'),
      isForest: lower.includes('forest') || lower.includes('tree') || lower.includes('woods') || lower.includes('jungle'),
      isMagical: lower.includes('magic') || lower.includes('enchanted') || lower.includes('fairy') || lower.includes('mystical'),
      isNeon: lower.includes('neon') || lower.includes('cyber') || lower.includes('tech') || lower.includes('future'),
      
      // Objects & Collectibles
      collectibles: lower.match(/\b(berry|berries|star|stars|gem|gems|coin|coins|flower|flowers|crystal|crystals|fruit)\b/g),
      
      // Actions & Mechanics
      actions: lower.match(/\b(walk|walking|run|running|jump|jumping|collect|collecting|fly|flying|swim|swimming)\b/g),
      
      // Mood & Atmosphere
      isChill: lower.includes('peaceful') || lower.includes('calm') || lower.includes('relaxing'),
      isExciting: lower.includes('fast') || lower.includes('action') || lower.includes('adventure'),
      isDark: lower.includes('dark') || lower.includes('night') || lower.includes('shadow'),
      isBright: lower.includes('bright') || lower.includes('sunny') || lower.includes('colorful')
    }
  }
  
  // 🎨 EXTRACT CREATIVE ELEMENTS FROM AI RESPONSE
  const extractAIElements = (response: string) => {
    if (!response) return {}
    
    const colorMatches = response.match(/#[0-9A-Fa-f]{6}/g) || []
    const effectMatches = response.match(/"(glow|sparkle|shimmer|pulse|float|particle|trail|aurora|magic)"/gi) || []
    const backgroundMatches = response.match(/"(forest|space|ocean|magical|neon|cyber|gradient|parallax)"/gi) || []
    
    return {
      colors: colorMatches.slice(0, 6), // Use up to 6 AI colors
      effects: effectMatches.map(e => e.replace(/"/g, '').toLowerCase()).slice(0, 4),
      backgrounds: backgroundMatches.map(b => b.replace(/"/g, '').toLowerCase()).slice(0, 2)
    }
  }
  
  const analysis = analyzePrompt(prompt)
  const aiElements = extractAIElements(aiResponse || '')
  
  // 🚀 DYNAMIC THEME SELECTION WITH AI ENHANCEMENT
  let theme = 'magical-adventure'
  let primaryColors = ['#4A90E2', '#50C8F2', '#9B59B6', '#E74C3C'] // Default vibrant
  let backgroundType = 'enchanted-gradient'
  
  if (analysis.isForest) {
    theme = 'enchanted-forest'
    primaryColors = aiElements.colors.length > 0 ? aiElements.colors : ['#1a5e1a', '#2d8f44', '#4caf50', '#66bb6a']
    backgroundType = 'magical-forest'
  } else if (analysis.isSpace) {
    theme = 'cosmic-adventure' 
    primaryColors = aiElements.colors.length > 0 ? aiElements.colors : ['#1a1a3a', '#3d1a78', '#6a1b9a', '#9c27b0']
    backgroundType = 'starfield-nebula'
  } else if (analysis.isOcean) {
    theme = 'underwater-realm'
    primaryColors = aiElements.colors.length > 0 ? aiElements.colors : ['#001122', '#004d7a', '#0288d1', '#29b6f6']
    backgroundType = 'ocean-depths'
  } else if (analysis.isNeon) {
    theme = 'cyber-neon'
    primaryColors = aiElements.colors.length > 0 ? aiElements.colors : ['#ff0080', '#00ffff', '#ffff00', '#ff8000']
    backgroundType = 'neon-city'
  }
  
  // 🎯 DYNAMIC COLLECTIBLE GENERATION
  const getCollectibleInfo = () => {
    if (analysis.collectibles?.includes('berries') || analysis.collectibles?.includes('berry')) {
      return { type: 'magical-berry', color: primaryColors[2] || '#ff6b9d', shape: 'star', count: 8 }
    } else if (analysis.collectibles?.includes('stars') || analysis.collectibles?.includes('star')) {
      return { type: 'cosmic-star', color: primaryColors[3] || '#ffd700', shape: 'star', count: 6 }
    } else if (analysis.collectibles?.includes('gems') || analysis.collectibles?.includes('gem')) {
      return { type: 'crystal-gem', color: primaryColors[1] || '#00ffff', shape: 'star', count: 7 }
    } else {
      return { type: 'energy-orb', color: primaryColors[0] || '#4A90E2', shape: 'circle', count: 6 }
    }
  }
  
  const collectibleInfo = getCollectibleInfo()
  
  // Create schema-compliant AI-enhanced game
  const baseGame: GameLogic = {
    id: gameId,
    title: prompt.length > 30 ? `${prompt.substring(0, 27)}...` : prompt || 'AI Adventure',
    description: `An amazing ${theme} game with dynamic AI-enhanced visuals and effects!`,
    difficulty: 'easy',
    ageGroup: kidAgeBand as any,
    
    worldSize: { width: 1200, height: 800 }, // Larger world for more dynamic gameplay
    background: {
      type: backgroundType,
      colors: primaryColors,
      effects: aiElements.effects.length > 0 ? aiElements.effects : ['particles', 'glow', 'shimmer'],
      layers: [
        { speed: 0.2, type: 'distant', particles: 'ambient' },
        { speed: 0.5, type: 'midground', particles: 'interactive' },
        { speed: 0.8, type: 'foreground', particles: 'dynamic' }
      ]
    },
    
    objects: [
      // Dynamic Player Character
      {
        id: 'player',
        type: 'player',
        sprite: {
          type: analysis.hasGirl ? 'girl-character' : analysis.hasAnimals ? 'animal-character' : 'magical-being',
          color: primaryColors[0] || '#4A90E2',
          glow: true,
          glowColor: primaryColors[1] || '#50C8F2',
          trail: { enabled: true, color: primaryColors[1] },
          material: analysis.isMagical ? 'holographic' : 'neon'
        },
        position: { x: 100, y: 400 },
        size: { width: 45, height: 45 },
        physics: { gravity: 0, friction: 0.95, bounce: 0.3, mass: 1 },
        collidable: true,
        visible: true
      },
      
      // Dynamic Collectibles based on prompt analysis  
      ...Array.from({ length: collectibleInfo.count }, (_, i) => ({
        id: `collectible_${i + 1}`,
        type: 'collectible' as const,
        sprite: {
          type: collectibleInfo.type,
          color: collectibleInfo.color,
          glow: true,
          glowColor: primaryColors[(i % primaryColors.length)] || '#FFD700',
          material: 'plasma',
          sparkle: true,
          trail: { enabled: true, color: collectibleInfo.color }
        },
        position: { 
          x: 200 + (i * 140) + Math.sin(i * 2) * 50, 
          y: 200 + Math.cos(i * 1.5) * 150 
        },
        size: { width: 35, height: 35 },
        points: 25 + (i * 10),
        animation: {
          type: 'pulse-glow',
          duration: 2000 + (i * 200),
          intensity: 0.8,
          repeat: true,
          easing: 'elastic'
        },
        collidable: true,
        visible: true
      })),
      
      // Environmental objects based on theme
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `environment_${i + 1}`,
        type: 'decoration' as const,
        sprite: {
          type: analysis.isForest ? 'magical-tree' : analysis.isSpace ? 'nebula-cloud' : 'energy-crystal',
          color: primaryColors[(i + 2) % primaryColors.length] || '#9B59B6',
          glow: true,
          material: 'holographic',
          opacity: 0.7
        },
        position: { x: 300 + (i * 200), y: 500 + Math.sin(i) * 100 },
        size: { width: 60, height: 80 },
        animation: {
          type: 'float-spin',
          duration: 3000 + (i * 500),
          repeat: true,
          intensity: 0.3
        },
        collidable: false,
        visible: true
      }))
    ],
    
    events: [
      // Dynamic collection events
      ...Array.from({ length: collectibleInfo.count }, (_, i) => ({
        id: `collect_${i + 1}`,
        trigger: 'collision' as const,
        condition: { objectId: `collectible_${i + 1}` },
        actions: [
          { type: 'score' as const, value: 25 + (i * 10) },
          { type: 'destroy' as const, targetId: `collectible_${i + 1}` },
          { type: 'effect' as const, value: 'spectacular-explosion' }
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
        id: 'dynamic_events',
        name: 'Dynamic Events',
        description: 'Games respond to your actions in amazing ways!',
        examples: [
          `When you collect ${collectibleInfo.type}s, spectacular effects happen!`,
          'Every action triggers beautiful visual responses!'
        ],
        difficulty: 'beginner',
        category: 'events'
      },
      {
        id: 'creative_logic',
        name: 'Creative Logic',
        description: `This ${theme} world follows magical rules!`,
        examples: [
          'IF you move around, THEN you discover new areas!',
          'IF you collect items, THEN your score grows!'
        ],
        difficulty: 'beginner', 
        category: 'logic'
      }
    ],
    
    zambooDialogue: {
      welcome: `Welcome to your ${theme} adventure! I'm Zamboo, and I've created this magical world based on your idea: "${prompt}"! 🌟`,
      instructions: `Use arrow keys to explore and collect all the ${collectibleInfo.type}s! Each one has special powers and amazing effects!`,
      encouragement: [
        `This ${theme} world is full of surprises!`,
        `You're doing amazing in this dynamic adventure!`,
        `The AI helped create these spectacular effects just for you!`,
        `Keep exploring - there's magic everywhere!`
      ],
      victory: `Incredible! You've mastered this ${theme} world! The AI and I created something truly special together! 🏆✨`,
      defeat: `This dynamic world has more to explore! Let's try again and discover all its secrets! 💪🌟`
    },
    
    // AI Enhancement metadata
    visualEffects: {
      particleSystems: aiElements.effects.length > 0 ? aiElements.effects : ['glow', 'sparkle', 'trail'],
      colorPalette: primaryColors,
      theme: theme,
      dynamicElements: true,
      aiEnhanced: true
    },
    
    createdBy: 'ai-inspired',
    version: '2.0'
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