import { NextRequest, NextResponse } from 'next/server'
import { generateGameFromPrompt, DeepSeekGameRequest, DeepSeekGameResponse } from '../../../deepseek'

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
        ],
        aiGenerated: false,
        fallbackUsed: false
      } satisfies DeepSeekGameResponse, { status: 400 })
    }

    // Validate age band
    if (!['4-6', '7-9', '10-12'].includes(kidAgeBand)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid age band. Must be 4-6, 7-9, or 10-12',
        suggestions: [
          'Use 4-6 for preschoolers',
          'Use 7-9 for elementary kids', 
          'Use 10-12 for middle schoolers'
        ],
        aiGenerated: false,
        fallbackUsed: false
      } satisfies DeepSeekGameResponse, { status: 400 })
    }

    const request: DeepSeekGameRequest = {
      prompt: prompt.trim(),
      kidAgeBand,
      complexity: complexity || 'normal'
    }

    console.log('🎮 Processing GameSpec generation request:', {
      prompt: request.prompt,
      kidAgeBand: request.kidAgeBand,
      complexity: request.complexity
    })

    // Generate the GameSpec
    const response = await generateGameFromPrompt(request)

    // Return the response
    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 GameSpec API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown server error',
      aiGenerated: false,
      fallbackUsed: false,
      suggestions: [
        'Try rephrasing your game idea',
        'Make sure your prompt is kid-friendly',
        'Try a simpler game concept'
      ]
    } satisfies DeepSeekGameResponse, { status: 500 })
  }
}