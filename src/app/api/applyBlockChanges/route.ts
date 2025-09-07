import { NextRequest, NextResponse } from 'next/server';
import type { GameLogic } from '@/types';

interface CodingBlock {
  id: string;
  type: 'object' | 'action' | 'event';
  name: string;
  color: string;
  x: number;
  y: number;
}

export async function POST(request: NextRequest) {
  try {
    const { gameLogic, blocks } = await request.json();

    if (!gameLogic || !blocks) {
      return NextResponse.json(
        { error: 'Missing gameLogic or blocks in request' },
        { status: 400 }
      );
    }

    const modifiedGame = applyBlockChangesToGame(gameLogic, blocks);
    return NextResponse.json(modifiedGame);

  } catch (error) {
    console.error('Error in applyBlockChanges API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function applyBlockChangesToGame(gameLogic: any, blocks: CodingBlock[]): any {
  const modifiedGame = JSON.parse(JSON.stringify(gameLogic));
  
  // Analyze block positions to determine connections and relationships
  const blocksByArea = groupBlocksByArea(blocks);
  
  // Apply modifications based on block arrangements
  Object.entries(blocksByArea).forEach(([area, areaBlocks]) => {
    const objectBlocks = areaBlocks.filter(b => b.type === 'object');
    const actionBlocks = areaBlocks.filter(b => b.type === 'action');
    const eventBlocks = areaBlocks.filter(b => b.type === 'event');
    
    // If blocks are clustered together (same area), create connections between them
    if (objectBlocks.length > 0 && actionBlocks.length > 0) {
      applyObjectActionConnection(modifiedGame, objectBlocks, actionBlocks);
    }
    
    if (eventBlocks.length > 0 && actionBlocks.length > 0) {
      applyEventActionConnection(modifiedGame, eventBlocks, actionBlocks);
    }
  });
  
  // Apply specific block modifications based on individual blocks
  blocks.forEach(block => {
    applyIndividualBlockEffect(modifiedGame, block);
  });
  
  // Update Zamboo's message
  modifiedGame.zamboo = {
    ...modifiedGame.zamboo,
    message: "Great job arranging those blocks! Your game has been updated! 🧩✨"
  };
  
  return modifiedGame;
}

function groupBlocksByArea(blocks: CodingBlock[]): { [area: string]: CodingBlock[] } {
  const areas: { [area: string]: CodingBlock[] } = {};
  const gridSize = 80; // Group blocks within 80px of each other
  
  blocks.forEach(block => {
    const areaX = Math.floor(block.x / gridSize);
    const areaY = Math.floor(block.y / gridSize);
    const areaKey = `${areaX}_${areaY}`;
    
    if (!areas[areaKey]) {
      areas[areaKey] = [];
    }
    areas[areaKey].push(block);
  });
  
  return areas;
}

function applyObjectActionConnection(gameLogic: any, objectBlocks: CodingBlock[], actionBlocks: CodingBlock[]): void {
  const playerBlocks = objectBlocks.filter(b => b.id === 'player');
  const moveBlocks = actionBlocks.filter(b => b.id === 'move-right');
  const jumpBlocks = actionBlocks.filter(b => b.id === 'jump');
  
  // If player and move blocks are together, increase player speed
  if (playerBlocks.length > 0 && moveBlocks.length > 0) {
    gameLogic.objects?.forEach((obj: any) => {
      if (obj.type === 'player') {
        obj.physics = obj.physics || {};
        obj.physics.speed = Math.min((obj.physics.speed || 200) * 1.2, 300);
      }
    });
  }
  
  // If player and jump blocks are together, improve jump ability
  if (playerBlocks.length > 0 && jumpBlocks.length > 0) {
    gameLogic.objects?.forEach((obj: any) => {
      if (obj.type === 'player') {
        obj.physics = obj.physics || {};
        obj.physics.jumpPower = Math.min((obj.physics.jumpPower || 300) * 1.2, 400);
      }
    });
  }
}

function applyEventActionConnection(gameLogic: any, eventBlocks: CodingBlock[], actionBlocks: CodingBlock[]): void {
  const collectBlocks = eventBlocks.filter(b => b.id === 'collect');
  const scoreBlocks = actionBlocks.filter(b => b.id === 'score');
  
  // If collect and score blocks are together, increase score value
  if (collectBlocks.length > 0 && scoreBlocks.length > 0) {
    gameLogic.events?.forEach((event: any) => {
      if (event.type === 'collision' && event.action === 'score') {
        event.value = Math.min((event.value || 10) * 1.5, 50);
      }
    });
  }
}

function applyIndividualBlockEffect(gameLogic: any, block: CodingBlock): void {
  // Apply effects based on block position
  const isTopArea = block.y < 100;
  const isBottomArea = block.y > 200;
  const isLeftArea = block.x < 100;
  const isRightArea = block.x > 200;
  
  switch (block.id) {
    case 'player':
      // If player block is moved to different areas, modify player properties
      if (isTopArea) {
        // Top area: make player lighter/faster
        gameLogic.objects?.forEach((obj: any) => {
          if (obj.type === 'player') {
            obj.physics = obj.physics || {};
            obj.physics.gravity = Math.max((obj.physics.gravity || 500) * 0.8, 300);
          }
        });
      }
      if (isBottomArea) {
        // Bottom area: make player heavier
        gameLogic.objects?.forEach((obj: any) => {
          if (obj.type === 'player') {
            obj.physics = obj.physics || {};
            obj.physics.gravity = Math.min((obj.physics.gravity || 500) * 1.2, 800);
          }
        });
      }
      break;
      
    case 'collectible':
      // If collectible block is in different areas, affect collectible properties
      if (isRightArea) {
        // Right area: add more collectibles
        const existingCollectibles = gameLogic.objects?.filter((obj: any) => obj.type === 'collectible') || [];
        if (existingCollectibles.length > 0 && existingCollectibles.length < 10) {
          const newCollectible = JSON.parse(JSON.stringify(existingCollectibles[0]));
          newCollectible.id = `collectible_${Date.now()}_${Math.random()}`;
          newCollectible.x = Math.random() * 600 + 100;
          newCollectible.y = Math.random() * 400 + 100;
          gameLogic.objects.push(newCollectible);
        }
      }
      break;
      
    case 'move-right':
      // Movement block affects based on position
      if (isLeftArea) {
        // Left area: enable left movement too
        gameLogic.objects?.forEach((obj: any) => {
          if (obj.type === 'player') {
            obj.controls = obj.controls || {};
            obj.controls.left = true;
          }
        });
      }
      break;
      
    case 'jump':
      // Jump block in top area = higher jumps
      if (isTopArea) {
        gameLogic.objects?.forEach((obj: any) => {
          if (obj.type === 'player') {
            obj.physics = obj.physics || {};
            obj.physics.jumpPower = Math.min((obj.physics.jumpPower || 300) * 1.3, 500);
          }
        });
      }
      break;
  }
}