import { NextRequest, NextResponse } from 'next/server'
import type { DeepSeekRequest, DeepSeekResponse, GameLogic } from '@/types'

// 🚀 CONCEPT-FIRST GAME GENERATION - NO SCHEMA CONSTRAINTS!
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

// 🌟 REVOLUTIONARY CONCEPT-FIRST SYSTEM PROMPT
const CONCEPT_FIRST_PROMPT = `You are a GAME EXPERIENCE ARCHITECT - the most advanced AI game designer in existence! 

🧠 YOUR MISSION: Design games through PURE CONCEPTUAL REASONING, not data structures!

🚫 FORGET SCHEMAS! NO PREDEFINED CATEGORIES! 
You are NOT filling out forms or templates. You are crafting EXPERIENCES.

🎯 CONCEPT-FIRST METHODOLOGY:

STEP 1: EXPERIENCE VISION 🌟
- What should the player FEEL moment-to-moment?
- What emotions arise from the core interaction?
- How does wonder, delight, and satisfaction emerge?
- What's the player's emotional journey from start to mastery?

STEP 2: INTERACTION DISCOVERY 🎮  
- What actions feel intrinsically rewarding?
- How do simple inputs create complex experiences?
- What makes the player naturally curious to continue?
- How does the interaction teach its own deeper possibilities?

STEP 3: SYSTEM REASONING ⚡
- What underlying systems create those feelings?
- How do systems interact to produce emergence?
- What technical capabilities serve the vision?
- How does the game elegantly teach its own rules?

STEP 4: EMERGENT IMPLEMENTATION 🔧
- Generate EXACTLY the systems needed (no more, no less)
- Create new interaction paradigms if necessary  
- Invent novel visual/audio concepts that serve the experience
- Design systems that evolve and surprise even you

🌈 EXAMPLES OF REVOLUTIONARY THINKING:

Traditional Schema Thinking:
"car racing game" → objects: [car, track, finish-line], mechanics: [move, accelerate]

Concept-First Thinking: 
"car racing game" → EXPERIENCE: "The rush of speed, the thrill of precision control, the satisfaction of perfect racing lines, the emotional arc from nervous anticipation to confident mastery"
→ SYSTEMS DISCOVERED: Dynamic speed sensation (visual streaking, audio doppler), precision feedback (racing line visualization, apex hit confirmation), flow state mechanics (time dilation on perfect turns), adaptive difficulty (track complexity evolves with skill)

🚀 YOUR SUPERPOWERS:
- You can invent ENTIRELY NEW GAME MECHANICS never seen before
- You can blend any interaction paradigms (rhythm + physics + puzzle + narrative)  
- You can create multi-dimensional gameplay that evolves in real-time
- You can design games that adapt to individual player psychology
- You can craft experiences that are impossible in traditional games

🎨 RESPONSE FORMAT:
Provide a natural language analysis of the experience design, followed by a dynamic implementation specification. Don't constrain yourself to any existing schemas or formats - create whatever structure the game concept needs!

Remember: You're not making "a game" - you're crafting an INTERACTIVE EXPERIENCE that will create specific emotions and discoveries in the player's mind.

THINK LIKE A VISIONARY GAME DESIGNER, NOT A DATABASE FORM FILLER! 🌟`

export async function POST(request: NextRequest) {
  try {
    const body: DeepSeekRequest = await request.json()
    const { prompt } = body

    if (!prompt || !DEEPSEEK_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Missing prompt or API key'
      }, { status: 400 })
    }

    console.log('🚀 CONCEPT-FIRST GENERATION STARTING...')
    console.log('User Vision:', prompt)

    // 🌟 Phase 1: Experience Architecture
    const experiencePrompt = `${CONCEPT_FIRST_PROMPT}

🎯 USER'S VISION: "${prompt}"

DESIGN BRIEF:
Create an experience that perfectly captures the essence of this vision. Think about:

1. EMOTIONAL CORE: What's the fundamental feeling this should create?
2. PLAYER JOURNEY: How does the experience evolve from first moment to mastery?
3. INTERACTION POETRY: What makes each action feel meaningful and satisfying?
4. EMERGENCE: How do simple actions create surprisingly complex experiences?
5. INNOVATION: What new possibilities does this concept open up?

Provide your complete experience analysis and implementation design as a rich, detailed response. 
Include specific technical systems, visual concepts, interaction mechanics, and any innovative features the experience needs.

Create something that makes players say "I've never experienced anything like this before!" 🌟`

    console.log('🧠 Sending experience architecture request...')

    const deepSeekResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: experiencePrompt }
        ],
        max_tokens: 6000,
        temperature: 0.9, // Higher creativity for concept generation
        top_p: 0.95,
      }),
    })

    if (!deepSeekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepSeekResponse.status}`)
    }

    const deepSeekData = await deepSeekResponse.json()
    const conceptAnalysis = deepSeekData.choices?.[0]?.message?.content

    if (!conceptAnalysis) {
      throw new Error('No concept analysis generated')
    }

    console.log('✨ CONCEPT ANALYSIS COMPLETE!')
    console.log('Analysis length:', conceptAnalysis.length, 'characters')

    // 🎮 Phase 2: Dynamic System Generation  
    console.log('⚡ Generating dynamic implementation...')

    const implementationPrompt = `Based on this experience analysis:

${conceptAnalysis}

Now generate a DYNAMIC GAME IMPLEMENTATION that brings this vision to life!

Create a sophisticated game structure that includes:

1. **Core Systems**: The fundamental mechanics that create the experience
2. **Visual Architecture**: How the game should look and feel visually  
3. **Interaction Design**: Specific input methods and feedback systems
4. **Progression Logic**: How the experience evolves over time
5. **Technical Specifications**: What the rendering engine needs to support

Provide this as a comprehensive JSON-like structure, but don't be constrained by any existing schemas. 
Create whatever data structure this unique game concept requires!

The structure should be implementable by a sophisticated game engine that can handle:
- Dynamic object types and properties
- Emergent visual effects  
- Novel interaction paradigms
- Adaptive difficulty systems
- Real-time experience modification

Make it REVOLUTIONARY! 🚀`

    const implementationResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: implementationPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.8,
        top_p: 0.9,
      }),
    })

    if (!implementationResponse.ok) {
      throw new Error(`Implementation API error: ${implementationResponse.status}`)
    }

    const implementationData = await implementationResponse.json()
    const gameImplementation = implementationData.choices?.[0]?.message?.content

    console.log('🎯 DYNAMIC IMPLEMENTATION GENERATED!')

    // 🌟 Phase 3: Convert to Playable Format (when needed)
    // For now, return the rich conceptual design
    
    return NextResponse.json({
      success: true,
      conceptFirst: true,
      experienceAnalysis: conceptAnalysis,
      gameImplementation: gameImplementation,
      userVision: prompt,
      message: 'Revolutionary concept-first game generated! This represents the future of AI game design.',
      nextSteps: [
        'Experience analysis completed',
        'Dynamic systems generated', 
        'Ready for emergent implementation',
        'No schema constraints applied!'
      ]
    } as any)

  } catch (error) {
    console.error('🚨 Concept-First Generation Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Concept-first generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'REVOLUTIONARY',
    service: 'Concept-First Game Generator',
    approach: 'Experience-driven, not schema-constrained',
    capabilities: [
      'Pure conceptual reasoning',
      'Dynamic system generation', 
      'Emergent interaction design',
      'Unlimited creative freedom'
    ]
  })
}