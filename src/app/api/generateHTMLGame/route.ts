import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // 5 minutes

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
- Canvas-based rendering with smooth animations (60fps max)
- Touch-friendly controls (virtual buttons for mobile)
- Kid-appropriate colors, sounds (beeps), and feedback
- Score display and simple restart mechanism
- CRITICAL RESPONSIVE CANVAS SYSTEM:
  * MANDATORY: Use the provided responsive scaling functions (getScaleFactors, drawText, drawObject)
  * ALL text must use drawText() function with base font sizes (automatically scales)
  * ALL game objects must use drawObject() or scale coordinates with uniformScale
  * Game logic coordinates should use BASE_WIDTH (800) and BASE_HEIGHT (600) as reference
  * NO direct ctx.fillText() or ctx.fillRect() - use the provided scaling functions
  * Text sizes automatically scale: drawText('Score: 100', 10, 30, 24) scales 24px font
  * Objects automatically scale: drawObject(player.x, player.y, 40, 40) scales 40x40 object
  * Canvas CSS uses clamp() but JavaScript handles internal coordinate scaling
  * Result: Game elements perfectly sized for any screen (mobile to desktop)

⚡ PERFORMANCE GUIDELINES:
- Use deltaTime for consistent movement speed across devices
- Cap movement speeds for kid-friendly gameplay (player: ~200px/s, objects: ~100-150px/s)
- Use requestAnimationFrame properly for smooth 60fps
- Add game speed controls: const GAME_SPEED = 1.0; // Adjustable multiplier
- Test speeds feel comfortable for children (not too fast/slow)

🎯 EXAMPLE OUTPUT FORMAT:
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Title</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            overflow: hidden; 
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #87CEEB;
        }
        canvas { 
            border: 2px solid #333; 
            border-radius: 8px;
            max-width: 100vw;
            max-height: 100vh;
            display: block;
        }
        .game-title {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: clamp(24px, 5vw, 48px);
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .game-ui {
            position: absolute;
            font-size: clamp(16px, 3vw, 24px);
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }
        /* Mobile touch controls styling */
        .touch-button, .game-button, button {
            background: #148AFF !important;
            color: white !important;
            border: 2px solid #1056CC !important;
            border-radius: 12px !important;
            padding: 12px 16px !important;
            font-weight: 600 !important;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
            box-shadow: 0 2px 8px rgba(20, 138, 255, 0.3) !important;
            cursor: pointer !important;
            user-select: none !important;
            touch-action: manipulation !important;
            transition: all 0.2s ease !important;
        }
        .touch-button:hover, .game-button:hover, button:hover {
            background: #1056CC !important;
            box-shadow: 0 4px 12px rgba(20, 138, 255, 0.4) !important;
            transform: translateY(-1px) !important;
        }
        .touch-button:active, .game-button:active, button:active {
            background: #0C4299 !important;
            transform: translateY(0) !important;
            box-shadow: 0 2px 6px rgba(20, 138, 255, 0.3) !important;
        }
    </style>
</head>
<body>
    <canvas id="game"></canvas>
    <script>
        // CRITICAL: Responsive canvas scaling system
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        
        // Base canvas dimensions (design size)
        const BASE_WIDTH = 800;
        const BASE_HEIGHT = 600;
        
        // Dynamic scaling system
        function getScaleFactors() {
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width / BASE_WIDTH;
            const scaleY = rect.height / BASE_HEIGHT;
            const uniformScale = Math.min(scaleX, scaleY); // Use smaller scale to maintain aspect ratio
            return { scaleX, scaleY, uniformScale, canvasWidth: rect.width, canvasHeight: rect.height };
        }
        
        // Responsive text rendering function
        function drawText(text, x, y, baseFontSize = 24, color = 'white', align = 'left') {
            const { uniformScale } = getScaleFactors();
            const fontSize = Math.max(12, baseFontSize * uniformScale);
            ctx.font = fontSize + 'px Arial';
            ctx.fillStyle = color;
            ctx.textAlign = align;
            ctx.fillText(text, x * uniformScale, y * uniformScale);
        }
        
        // Responsive object rendering function
        function drawObject(x, y, width, height, color = 'red') {
            const { uniformScale } = getScaleFactors();
            ctx.fillStyle = color;
            ctx.fillRect(
                x * uniformScale, 
                y * uniformScale, 
                width * uniformScale, 
                height * uniformScale
            );
        }
        
        // Responsive circle drawing function
        function drawCircle(x, y, radius, color = 'blue') {
            const { uniformScale } = getScaleFactors();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x * uniformScale, y * uniformScale, radius * uniformScale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Responsive line drawing function
        function drawLine(x1, y1, x2, y2, color = 'black', lineWidth = 2) {
            const { uniformScale } = getScaleFactors();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth * uniformScale;
            ctx.beginPath();
            ctx.moveTo(x1 * uniformScale, y1 * uniformScale);
            ctx.lineTo(x2 * uniformScale, y2 * uniformScale);
            ctx.stroke();
        }
        
        // Game variables scaled to base dimensions
        let gameState = {
            player: { x: BASE_WIDTH/2, y: BASE_HEIGHT/2, width: 40, height: 40 },
            // All game coordinates use BASE_WIDTH and BASE_HEIGHT coordinates
        };
        
        // Game loop with responsive rendering
        function gameLoop() {
            const { canvasWidth, canvasHeight } = getScaleFactors();
            
            // Clear canvas
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            // MANDATORY: Use only responsive drawing functions
            // drawObject(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height, 'blue');
            // drawText('Score: ' + score, 10, 30, 24, 'white');
            // drawCircle(powerup.x, powerup.y, 15, 'yellow');
            // drawText('GAME OVER!', BASE_WIDTH/2, BASE_HEIGHT/2, 48, 'red', 'center');
            // drawLine(0, BASE_HEIGHT-50, BASE_WIDTH, BASE_HEIGHT-50, 'green', 3); // Ground line
            
            requestAnimationFrame(gameLoop);
        }
        
        // Initialize canvas size handling
        function resizeCanvas() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Complete game logic here - ALWAYS use responsive functions: drawText, drawObject, drawCircle, drawLine
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
- Canvas-based with smooth animations (60fps)
- Score system and restart functionality
- Touch controls for mobile devices
- IMPORTANT: Use proper deltaTime for movement speed consistency
- IMPORTANT: Keep movement speeds moderate for kids (player: ~200px/second max)
- IMPORTANT: Include const GAME_SPEED = 1.0; multiplier for speed adjustments
- CRITICAL: IMPLEMENT RESPONSIVE CANVAS SCALING - MANDATORY:
  * MUST use the provided responsive functions: drawText(), drawObject(), getScaleFactors()
  * NEVER use direct ctx.fillText() or ctx.fillRect() - always use scaling functions
  * Example: drawText('Game Over!', 400, 300, 48, 'red', 'center') auto-scales 48px font
  * Example: drawObject(player.x, player.y, player.width, player.height, 'blue') auto-scales
  * All coordinates in BASE_WIDTH (800) x BASE_HEIGHT (600) coordinate system
  * Functions automatically adapt to any screen size (mobile/tablet/desktop)
  * Text stays readable, objects stay proportional on all devices

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
    const timeoutId = setTimeout(() => controller.abort(), 150000) // 2.5 minute timeout
    
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