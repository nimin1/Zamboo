import { NextRequest, NextResponse } from 'next/server'

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

🎯 EXAMPLE OUTPUT FORMAT:
<!DOCTYPE html>
<html>
<head>
    <title>Game Title</title>
    <style>
        /* All CSS here */
    </style>
</head>
<body>
    <canvas id="game"></canvas>
    <script>
        // Complete game logic here
    </script>
</body>
</html>

RESPOND WITH COMPLETE HTML FILE ONLY - NO MARKDOWN, NO EXPLANATIONS:`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt, kidAgeBand, complexity } = body

    // Validate required fields
    if (!prompt || !kidAgeBand) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: prompt and kidAgeBand',
        suggestions: [
          'Please provide a game description',
          'Please specify age group (4-6, 7-9, or 10-12)',
        ]
      }, { status: 400 })
    }

    // Check if DeepSeek API is available
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Game generation service temporarily unavailable',
        suggestions: [
          'Please try again later',
          'Contact support if the issue persists'
        ]
      }, { status: 503 })
    }

    // Create HTML game generation prompt
    const enhancedPrompt = `User idea: ${prompt}

Create a complete HTML game for kids age ${kidAgeBand}:
- Theme and mechanics based on: "${prompt}"
- Difficulty: ${complexity || 'medium'}
- Kid-friendly colors and simple controls
- Canvas-based with smooth animations
- Score system and restart functionality
- Touch controls for mobile devices

Generate the complete HTML file now:`

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: ZAMBOO_HTML_GAME_SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: enhancedPrompt
      }
    ]

    console.log('🎮 Generating HTML game for:', prompt)
    console.log('👶 Age group:', kidAgeBand)
    console.log('⚡ Difficulty:', complexity || 'medium')

    // Call DeepSeek API
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 1 minute timeout
    
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
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!deepSeekResponse.ok) {
      const errorData = await deepSeekResponse.text()
      console.error('DeepSeek API Error:', deepSeekResponse.status, errorData)
      
      return NextResponse.json({
        success: false,
        error: `Failed to generate game (Status: ${deepSeekResponse.status})`,
        suggestions: [
          'Try a simpler game idea',
          'Make sure your prompt is clear and family-friendly',
          'Consider a different game type like "collector" or "maze"'
        ]
      }, { status: 500 })
    }

    const deepSeekData = await deepSeekResponse.json()
    const htmlGameContent = deepSeekData.choices?.[0]?.message?.content

    if (!htmlGameContent) {
      return NextResponse.json({
        success: false,
        error: 'No game generated',
        suggestions: ['Try rephrasing your game idea', 'Be more specific about what you want']
      }, { status: 500 })
    }

    console.log('🎉 HTML game generated successfully!')
    console.log('📏 Game size:', htmlGameContent.length, 'characters')

    // Clean up HTML content - remove markdown formatting if present
    let cleanHtml = htmlGameContent.trim()
    
    // Remove markdown code blocks if present
    if (cleanHtml.startsWith('```html')) {
      cleanHtml = cleanHtml.replace(/```html\n?/, '').replace(/\n?```$/, '')
    } else if (cleanHtml.startsWith('```')) {
      cleanHtml = cleanHtml.replace(/```\n?/, '').replace(/\n?```$/, '')
    }

    // Ensure it starts with DOCTYPE
    if (!cleanHtml.toLowerCase().includes('<!doctype html>') && !cleanHtml.toLowerCase().includes('<html')) {
      cleanHtml = `<!DOCTYPE html>\n<html>\n<head><title>Zamboo Game</title></head>\n<body>\n${cleanHtml}\n</body>\n</html>`
    }

    return NextResponse.json({
      success: true,
      htmlGame: cleanHtml,
      gameTitle: extractTitleFromHtml(cleanHtml),
      zambooMessage: `🎮 Your ${prompt} game is ready to play!`,
      suggestions: [
        'Click and drag to move, or use arrow keys!',
        'Try to beat your high score!',
        'Share this game with friends!'
      ]
    })

  } catch (error: any) {
    console.error('HTML Game generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate game',
      suggestions: [
        'Please try again with a different game idea',
        'Make sure your prompt is clear and specific',
        'Try a simpler game concept'
      ]
    }, { status: 500 })
  }
}

// Helper function to extract title from HTML
function extractTitleFromHtml(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) {
    return titleMatch[1]
  }
  
  // Fallback - look for h1 tags
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1Match) {
    return h1Match[1]
  }
  
  return 'Zamboo Game'
}