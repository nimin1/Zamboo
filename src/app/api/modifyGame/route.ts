import { NextRequest, NextResponse } from 'next/server';
import type { GameLogic } from '@/types';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const GAME_MODIFICATION_SYSTEM_PROMPT = `You are Zamboo's Game Modification Assistant. You help kids modify their existing games based on voice commands.

IMPORTANT RULES:
1. Take the existing game and modify it based on the user's request
2. Keep all existing game structure intact unless specifically asked to change it
3. Make minimal changes - only what the user specifically requested
4. Always return valid GameLogic JSON that matches the schema
5. Preserve the game's title, basic structure, and core mechanics unless asked to change them
6. Be safe and educational - only make kid-friendly modifications
7. If the request is unclear or unsafe, make a simple, safe modification instead

EXAMPLES OF MODIFICATIONS:
- "make the player faster" → increase player speed
- "add more collectibles" → increase collectible count or add new collectibles
- "make it harder" → add obstacles or increase difficulty
- "change the background to space" → modify world.background
- "add jumping sound effect" → add sound to jump events
- "make the player bigger" → increase player size

Always return ONLY the modified GameLogic JSON with no additional text or explanation.`;

export async function POST(request: NextRequest) {
  try {
    const { gameLogic, modification } = await request.json();

    if (!gameLogic || !modification) {
      return NextResponse.json(
        { error: 'Missing gameLogic or modification in request' },
        { status: 400 }
      );
    }

    if (!DEEPSEEK_API_KEY) {
      // Fallback: make a simple modification locally
      const modifiedGame = makeSimpleModification(gameLogic, modification);
      return NextResponse.json(modifiedGame);
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: GAME_MODIFICATION_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Current game: ${JSON.stringify(gameLogic, null, 2)}

User wants to modify the game: "${modification}"

Please return the modified GameLogic JSON.`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status, response.statusText);
      const modifiedGame = makeSimpleModification(gameLogic, modification);
      return NextResponse.json(modifiedGame);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      const modifiedGame = makeSimpleModification(gameLogic, modification);
      return NextResponse.json(modifiedGame);
    }

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const modifiedGame = makeSimpleModification(gameLogic, modification);
      return NextResponse.json(modifiedGame);
    }

    try {
      const modifiedGame = JSON.parse(jsonMatch[0]);
      return NextResponse.json(modifiedGame);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      const modifiedGame = makeSimpleModification(gameLogic, modification);
      return NextResponse.json(modifiedGame);
    }

  } catch (error) {
    console.error('Error in modifyGame API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function makeSimpleModification(gameLogic: any, modification: string): any {
  const modifiedGame = JSON.parse(JSON.stringify(gameLogic));
  const lowerModification = modification.toLowerCase();

  // Simple local modifications based on common requests
  if (lowerModification.includes('faster') || lowerModification.includes('speed')) {
    // Make player faster
    modifiedGame.objects?.forEach((obj: any) => {
      if (obj.type === 'player' && obj.physics?.speed) {
        obj.physics.speed = Math.min(obj.physics.speed * 1.5, 400);
      }
    });
    modifiedGame.zamboo = {
      ...modifiedGame.zamboo,
      message: "I made your player faster! 🏃‍♂️✨"
    };
  } else if (lowerModification.includes('more') && lowerModification.includes('collectible')) {
    // Add more collectibles
    const collectibles = modifiedGame.objects?.filter((obj: any) => obj.type === 'collectible') || [];
    if (collectibles.length > 0) {
      const newCollectible = JSON.parse(JSON.stringify(collectibles[0]));
      newCollectible.id = `collectible_${Date.now()}`;
      newCollectible.x = Math.random() * 600 + 100;
      newCollectible.y = Math.random() * 400 + 100;
      modifiedGame.objects.push(newCollectible);
    }
    modifiedGame.zamboo = {
      ...modifiedGame.zamboo,
      message: "Added more collectibles to find! 🌟"
    };
  } else if (lowerModification.includes('bigger') || lowerModification.includes('larger')) {
    // Make player bigger
    modifiedGame.objects?.forEach((obj: any) => {
      if (obj.type === 'player') {
        obj.width = Math.min((obj.width || 40) * 1.3, 80);
        obj.height = Math.min((obj.height || 40) * 1.3, 80);
      }
    });
    modifiedGame.zamboo = {
      ...modifiedGame.zamboo,
      message: "Made your player bigger! 🦣"
    };
  } else if (lowerModification.includes('color') || lowerModification.includes('red') || lowerModification.includes('blue')) {
    // Change colors
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    modifiedGame.objects?.forEach((obj: any) => {
      if (obj.type === 'player') {
        obj.color = randomColor;
      }
    });
    modifiedGame.zamboo = {
      ...modifiedGame.zamboo,
      message: "Changed your player's color! 🎨"
    };
  } else {
    // Default: just update Zamboo's message to acknowledge the request
    modifiedGame.zamboo = {
      ...modifiedGame.zamboo,
      message: `I heard "${modification}" - let me think about that! 🤔`
    };
  }

  return modifiedGame;
}