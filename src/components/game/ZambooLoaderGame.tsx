"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface ZambooLoaderGameProps {
  progress: number;
  onGameComplete?: () => void;
}

type GameTemplate = 'car' | 'football' | 'fighting' | 'fighter_jet' | 'bird' | 'santa';

type GameType = 'platformer' | 'racing' | 'sports' | 'combat' | 'shooter' | 'collection' | 'delivery';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  collected?: boolean;
  animationOffset?: number;
  type?: string;
  points?: number;
  vy?: number; // For falling gifts
  isGift?: boolean; // For dropped gifts
}

interface GameState {
  panda: {
    x: number;
    y: number;
    width: number;
    height: number;
    isJumping: boolean;
    jumpVelocity: number;
    animationFrame: number;
    idleAnimation: number;
    isDead: boolean;
    invulnerable: boolean;
    invulnerabilityStart?: number;
  };
  objects: GameObject[];
  score: number;
  highScore: number;
  lives: number;
  gameTime: number;
  lastFrameTime: number;
  backgroundOffset: number;
  gameOver: boolean;
  restartTimer: number;
  combo: number;
  showCombo: boolean;
  comboTime?: number;
  lastGiftDrop?: number; // For Santa gift dropping timing
}

const ZambooLoaderGame: React.FC<ZambooLoaderGameProps> = ({
  progress,
  onGameComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());
  
  // Randomly select a game template
  const [gameTemplate] = useState<GameTemplate>(() => {
    const templates: GameTemplate[] = ['car', 'football', 'fighting', 'fighter_jet', 'bird', 'santa'];
    return templates[Math.floor(Math.random() * templates.length)];
  });

  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 500;
  const GROUND_Y = 400;
  const SCROLL_SPEED = 1.5; // Reduced for kid-friendly pace!
  const TARGET_FPS = 60;

  // Get game configuration based on template
  const getGameConfig = useCallback(() => {
    switch (gameTemplate) {
      case 'car':
        return {
          type: 'racing' as GameType,
          title: "🌃 Neon City Night Racer",
          player: { emoji: '🚗', name: 'car' },
          collectibles: [
            { emoji: '🪙', name: 'coin', points: 2, chance: 0.5 },
            { emoji: '⛽', name: 'fuel', points: 5, chance: 0.2 }
          ],
          obstacles: [{ emoji: '🚧', name: 'cone', chance: 0.3 }],
          background: { sky: '#0a0a1e', ground: '#1a1a1a' },
          goal: 'Race through the neon-lit city streets! Collect coins and fuel while dodging construction barriers!',
          controls: 'Use ← → Arrow Keys or A/D to steer through the glowing streets'
        };
      case 'football':
        return {
          type: 'sports' as GameType,
          title: "🏟️ Stadium Glory Championship",
          player: { emoji: '⚽', name: 'ball' },
          collectibles: [
            { emoji: '🥅', name: 'goal', points: 10, chance: 0.3 },
            { emoji: '⭐', name: 'star', points: 1, chance: 0.4 }
          ],
          obstacles: [{ emoji: '🧤', name: 'keeper', chance: 0.3 }],
          background: { sky: '#87CEEB', ground: '#228B22' },
          goal: 'Feel the roar of the crowd! Score spectacular goals while collecting victory stars!',
          controls: 'Use ↑ ↓ Arrow Keys or W/S to aim your legendary shots'
        };
      case 'fighting':
        return {
          type: 'combat' as GameType,
          title: "🏙️ Urban Alley Warrior",
          player: { emoji: '🥊', name: 'fighter' },
          collectibles: [
            { emoji: '💪', name: 'power', points: 3, chance: 0.3 },
            { emoji: '❤️', name: 'health', points: 5, chance: 0.2 }
          ],
          obstacles: [{ emoji: '👊', name: 'punch', chance: 0.5 }],
          background: { sky: '#2F1B14', ground: '#2F2F2F' },
          goal: 'Battle through the gritty streets! Gain power and heal while dodging enemy strikes!',
          controls: 'Use ↑ ↓ Arrow Keys or W/S to dodge and weave like a champion'
        };
      case 'fighter_jet':
        return {
          type: 'shooter' as GameType,
          title: "🚀 Cosmic Nebula Explorer",
          player: { emoji: '✈️', name: 'jet' },
          collectibles: [
            { emoji: '🚀', name: 'missile', points: 2, chance: 0.3 },
            { emoji: '⭐', name: 'star', points: 1, chance: 0.3 }
          ],
          obstacles: [{ emoji: '☄️', name: 'asteroid', chance: 0.4 }],
          background: { sky: '#1a0033', ground: '#000000' },
          goal: 'Soar through mystical nebulae! Gather cosmic missiles and stardust while avoiding meteors!',
          controls: 'Use ↑ ↓ ← → Arrow Keys or WASD to navigate the cosmos'
        };
      case 'bird':
        return {
          type: 'collection' as GameType,
          title: "🌈 Rainbow Garden Paradise",
          player: { emoji: '🐦', name: 'bird' },
          collectibles: [
            { emoji: '🪱', name: 'worm', points: 3, chance: 0.5 },
            { emoji: '🐛', name: 'bug', points: 1, chance: 0.3 }
          ],
          obstacles: [{ emoji: '🌿', name: 'branch', chance: 0.2 }],
          background: { sky: '#FFE4E1', ground: '#90EE90' },
          goal: 'Dance through a magical garden! Collect treats among blooming flowers and rainbows!',
          controls: 'Hold SPACE to flutter gracefully up, release to glide down'
        };
      case 'santa':
        return {
          type: 'delivery' as GameType,
          title: "❄️ Northern Lights Christmas Express",
          player: { emoji: '🛷', name: 'sleigh' },
          collectibles: [
            { emoji: '🏠', name: 'house', points: 10, chance: 0.6 },
            { emoji: '⭐', name: 'star', points: 2, chance: 0.2 }
          ],
          obstacles: [
            { emoji: '☁️', name: 'cloud', chance: 0.15 },
            { emoji: '🐦', name: 'bird', chance: 0.05 }
          ],
          background: { sky: '#000080', ground: '#FFFFFF' },
          goal: 'Ride beneath the aurora borealis! Deliver magical gifts to snow-covered homes!',
          controls: 'Use ← → to soar through the winter sky, SPACE to drop gifts'
        };
      default:
        // Fallback to car racing
        return {
          type: 'racing' as GameType,
          title: "🚗 Speed Racer - Coin Collector!",
          player: { emoji: '🚗', name: 'car' },
          collectibles: [
            { emoji: '🪙', name: 'coin', points: 2, chance: 0.5 },
            { emoji: '⛽', name: 'fuel', points: 5, chance: 0.2 }
          ],
          obstacles: [{ emoji: '🚧', name: 'cone', chance: 0.3 }],
          background: { sky: '#87CEEB', ground: '#808080' },
          goal: 'Steer left/right to collect 🪙 coins and ⛽ fuel, avoid 🚧 cones!',
          controls: 'Use ← → Arrow Keys or A/D to steer left and right'
        };
    }
  }, [gameTemplate]);

  const [gameState, setGameState] = useState<GameState>({
    panda: {
      x: 150,
      y: GROUND_Y,
      width: 70,
      height: 70,
      isJumping: false,
      jumpVelocity: 0,
      animationFrame: 0,
      idleAnimation: 0,
      isDead: false,
      invulnerable: false,
    },
    objects: [],
    score: 0,
    highScore: parseInt(localStorage.getItem("zambooLoaderHighScore") || "0"),
    lives: 3,
    gameTime: 0,
    lastFrameTime: 0,
    backgroundOffset: 0,
    gameOver: false,
    restartTimer: 0,
    combo: 0,
    showCombo: false,
  });

  // Initialize exciting game with mixed objects
  const initializeGame = useCallback(() => {
    const config = getGameConfig();
    const initObjects: GameObject[] = [];

    // Create initial mix of objects based on game template
    for (let i = 0; i < 20; i++) {
      const startX = CANVAS_WIDTH + i * (100 + Math.random() * 80);
      const objectType = Math.random();
      
      let cumulativeChance = 0;
      let selectedType: any = null;

      // Check collectibles first
      for (const collectible of config.collectibles) {
        cumulativeChance += collectible.chance;
        if (objectType < cumulativeChance) {
          selectedType = { ...collectible, isObstacle: false };
          break;
        }
      }

      // If no collectible selected, check obstacles
      if (!selectedType) {
        for (const obstacle of config.obstacles) {
          cumulativeChance += obstacle.chance;
          if (objectType < cumulativeChance) {
            selectedType = { ...obstacle, isObstacle: true, points: 0 };
            break;
          }
        }
      }

      // Fallback to first collectible if nothing selected
      if (!selectedType) {
        selectedType = { ...config.collectibles[0], isObstacle: false };
      }

      const isFloating = !selectedType.isObstacle && Math.random() > 0.5;
      const yPosition = isFloating ? 
        60 + Math.random() * 200 : // Floating objects
        selectedType.isObstacle ? 
          (Math.random() < 0.7 ? GROUND_Y - 35 : GROUND_Y - 80) : // Ground/elevated obstacles
          GROUND_Y - 50; // Ground collectibles

      initObjects.push({
        x: startX,
        y: yPosition,
        width: selectedType.isObstacle ? 45 : 35,
        height: selectedType.isObstacle ? 40 : 35,
        type: selectedType.name as any,
        points: selectedType.points,
        collected: false,
        animationOffset: Math.random() * Math.PI * 2,
      });
    }

    return {
      objects: initObjects,
      lastFrameTime: performance.now(),
    };
  }, [getGameConfig]);

  // Restart game after death
  const restartGame = useCallback(() => {
    const initialData = initializeGame();
    setGameState((prev) => ({
      ...prev,
      ...initialData,
      panda: {
        ...prev.panda,
        x: 80,
        y: GROUND_Y,
        isJumping: false,
        jumpVelocity: 0,
        isDead: false,
        invulnerable: false,
      },
      score: 0,
      lives: 3,
      gameOver: false,
      restartTimer: 0,
      combo: 0,
      showCombo: false,
    }));
  }, [initializeGame]);

  useEffect(() => {
    const initialData = initializeGame();
    setGameState((prev) => ({
      ...prev,
      ...initialData,
    }));
  }, [initializeGame]);

  // Smooth keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code);
      e.preventDefault();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Exciting game logic with collision detection and game over
  const updateGame = useCallback(
    (currentTime: number) => {
      const config = getGameConfig();
      const deltaTime = (currentTime - gameState.lastFrameTime) / 1000;
      const targetDelta = 1 / TARGET_FPS;

      if (deltaTime < targetDelta) {
        return gameState;
      }

      const newState = { ...gameState };
      newState.lastFrameTime = currentTime;
      newState.gameTime += deltaTime;
      newState.backgroundOffset =
        (newState.backgroundOffset + SCROLL_SPEED * deltaTime * 60) %
        CANVAS_WIDTH;

      // Handle game over state
      if (newState.gameOver) {
        newState.restartTimer += deltaTime;
        if (newState.restartTimer > 3) {
          // Auto restart after 3 seconds
          restartGame();
          return newState;
        }
        return newState;
      }

      // Update invulnerability timer
      if (newState.panda.invulnerable && newState.panda.invulnerabilityStart) {
        if (newState.gameTime - newState.panda.invulnerabilityStart > 2) {
          newState.panda.invulnerable = false;
        }
      }

      // Update combo display timer
      if (newState.showCombo && newState.comboTime) {
        if (newState.gameTime - newState.comboTime > 1.5) {
          newState.showCombo = false;
        }
      }

      // Update panda animation
      newState.panda.idleAnimation += deltaTime * 3;
      if (newState.panda.isJumping) {
        newState.panda.animationFrame += deltaTime * 8;
      } else {
        newState.panda.animationFrame =
          Math.sin(newState.panda.idleAnimation) * 0.1;
      }

      // Handle input based on game type
      const speed = 200;
      if (!newState.panda.isDead) {
        switch (config.type) {
          case 'racing': // Car game - left/right steering
            if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("KeyA")) {
              newState.panda.x -= speed * deltaTime * 1.5;
            }
            if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("KeyD")) {
              newState.panda.x += speed * deltaTime * 1.5;
            }
            break;
            
          case 'collection': // Bird - horizontal movement
            if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("KeyA")) {
              newState.panda.x -= speed * deltaTime * 1.5;
            }
            if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("KeyD")) {
              newState.panda.x += speed * deltaTime * 1.5;
            }
            // Special bird flapping
            if (gameTemplate === 'bird') {
              if (keysPressed.current.has("Space")) {
                newState.panda.y -= speed * deltaTime * 0.8;
              } else {
                newState.panda.y += speed * deltaTime * 0.4;
              }
            }
            break;
            
          case 'delivery': // Santa sleigh - fly and drop gifts
            if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("KeyA")) {
              newState.panda.x -= speed * deltaTime * 1.2;
            }
            if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("KeyD")) {
              newState.panda.x += speed * deltaTime * 1.2;
            }
            // Santa flies at a fixed height (upper part of screen)
            newState.panda.y = 80;
            
            // Drop gifts with SPACE
            if (keysPressed.current.has("Space")) {
              // Create a falling gift every 500ms to avoid spam
              const now = performance.now();
              if (!newState.lastGiftDrop || now - newState.lastGiftDrop > 500) {
                const gift: GameObject = {
                  x: newState.panda.x + newState.panda.width / 2 - 15,
                  y: newState.panda.y + newState.panda.height,
                  width: 30,
                  height: 30,
                  type: 'falling_gift',
                  points: 0,
                  collected: false,
                  isGift: true,
                  vy: 150, // Falling speed
                  animationOffset: Math.random() * Math.PI * 2
                };
                newState.objects.push(gift);
                newState.lastGiftDrop = now;
              }
            }
            break;
            
          case 'sports': // Football - up/down aiming
          case 'combat': // Fighting - duck/jump
            if (keysPressed.current.has("ArrowUp") || keysPressed.current.has("KeyW")) {
              newState.panda.y -= speed * deltaTime;
            }
            if (keysPressed.current.has("ArrowDown") || keysPressed.current.has("KeyS")) {
              newState.panda.y += speed * deltaTime;
            }
            break;
            
          case 'shooter': // Fighter jet - 4-directional movement
            if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("KeyA")) {
              newState.panda.x -= speed * deltaTime;
            }
            if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("KeyD")) {
              newState.panda.x += speed * deltaTime;
            }
            if (keysPressed.current.has("ArrowUp") || keysPressed.current.has("KeyW")) {
              newState.panda.y -= speed * deltaTime;
            }
            if (keysPressed.current.has("ArrowDown") || keysPressed.current.has("KeyS")) {
              newState.panda.y += speed * deltaTime;
            }
            break;
        }
      }

      // Keep player in bounds
      newState.panda.x = Math.max(0, Math.min(CANVAS_WIDTH - newState.panda.width, newState.panda.x));
      newState.panda.y = Math.max(0, Math.min(CANVAS_HEIGHT - newState.panda.height, newState.panda.y));

      // Move and manage objects
      const moveSpeed = SCROLL_SPEED * deltaTime * 60;
      newState.objects = newState.objects
        .map((obj) => {
          if (obj.isGift) {
            // Falling gifts move down instead of horizontally
            return {
              ...obj,
              y: obj.y + (obj.vy || 150) * deltaTime,
            };
          } else {
            // Regular objects move horizontally
            return {
              ...obj,
              x: obj.x - moveSpeed,
            };
          }
        })
        .filter((obj) => {
          if (obj.isGift) {
            return obj.y < CANVAS_HEIGHT + 50; // Remove gifts that fall off screen
          }
          return obj.x > -50; // Remove regular objects that move off screen
        });

      // Add new objects dynamically
      if (newState.objects.length < 20) {
        const lastObj = newState.objects[newState.objects.length - 1];
        const startX = lastObj
          ? Math.max(lastObj.x + 100 + Math.random() * 80, CANVAS_WIDTH + 50)
          : CANVAS_WIDTH + 50;
        const objectType = Math.random();
        
        let cumulativeChance = 0;
        let selectedType: any = null;

        // Check collectibles first
        for (const collectible of config.collectibles) {
          cumulativeChance += collectible.chance;
          if (objectType < cumulativeChance) {
            selectedType = { ...collectible, isObstacle: false };
            break;
          }
        }

        // If no collectible selected, check obstacles
        if (!selectedType) {
          for (const obstacle of config.obstacles) {
            cumulativeChance += obstacle.chance;
            if (objectType < cumulativeChance) {
              selectedType = { ...obstacle, isObstacle: true, points: 0 };
              break;
            }
          }
        }

        // Fallback to first collectible if nothing selected
        if (!selectedType) {
          selectedType = { ...config.collectibles[0], isObstacle: false };
        }

        let yPosition;
        if (config.type === 'delivery') {
          // For Santa game: houses on ground, obstacles in sky
          if (selectedType.name === 'house') {
            yPosition = GROUND_Y - 60; // Houses on ground
          } else {
            yPosition = 60 + Math.random() * 150; // Clouds and birds in sky
          }
        } else {
          // Original logic for other games
          const isFloating = !selectedType.isObstacle && Math.random() > 0.5;
          yPosition = isFloating ? 
            60 + Math.random() * 200 : // Floating objects
            selectedType.isObstacle ? 
              (Math.random() < 0.7 ? GROUND_Y - 35 : GROUND_Y - 80) : // Ground/elevated obstacles
              GROUND_Y - 50; // Ground collectibles
        }

        const newObject: GameObject = {
          x: startX,
          y: yPosition,
          width: selectedType.isObstacle ? 45 : 35,
          height: selectedType.isObstacle ? 40 : 35,
          type: selectedType.name as any,
          points: selectedType.points,
          collected: false,
          animationOffset: Math.random() * Math.PI * 2,
        };
        newState.objects.push(newObject);
      }

      // Special collision logic for Santa delivery game
      if (config.type === 'delivery') {
        // Check if falling gifts hit houses
        newState.objects.forEach((gift) => {
          if (!gift.isGift || gift.collected) return;
          
          newState.objects.forEach((house) => {
            if (house.type !== 'house' || house.collected) return;
            
            // Check if gift hits house
            const giftHitHouse =
              gift.x < house.x + house.width &&
              gift.x + gift.width > house.x &&
              gift.y < house.y + house.height &&
              gift.y + gift.height > house.y;
              
            if (giftHitHouse) {
              // Successful delivery!
              gift.collected = true;
              house.collected = true;
              newState.score += house.points || 10;
              newState.combo++;
              
              if (newState.combo >= 5) {
                newState.score += Math.floor(newState.combo / 5) * 2;
                newState.showCombo = true;
                newState.comboTime = newState.gameTime;
              }
            }
          });
        });
      }

      // Regular collision detection for player
      if (!newState.panda.isDead && !newState.panda.invulnerable) {
        const pandaRect = {
          x: newState.panda.x + 5,
          y: newState.panda.y + 5,
          width: newState.panda.width - 10,
          height: newState.panda.height - 10,
        };

        newState.objects.forEach((obj) => {
          if (obj.collected || obj.isGift) return; // Skip gifts and collected objects

          const collision =
            pandaRect.x < obj.x + obj.width &&
            pandaRect.x + pandaRect.width > obj.x &&
            pandaRect.y < obj.y + obj.height &&
            pandaRect.y + pandaRect.height > obj.y;

          if (collision) {
            const isObstacle = config.obstacles.some(obs => obs.name === obj.type);
            
            if (isObstacle) {
              // Hit an obstacle - lose a life!
              newState.panda.isDead = true;
              newState.lives--;
              newState.combo = 0;

              if (newState.lives <= 0) {
                newState.gameOver = true;
                newState.restartTimer = 0;
                // Save high score
                if (newState.score > newState.highScore) {
                  newState.highScore = newState.score;
                  localStorage.setItem(
                    "zambooLoaderHighScore",
                    newState.score.toString()
                  );
                }
              } else {
                // Respawn with invulnerability
                setTimeout(() => {
                  setGameState((prev) => ({
                    ...prev,
                    panda: {
                      ...prev.panda,
                      isDead: false,
                      invulnerable: true,
                      invulnerabilityStart: prev.gameTime,
                    },
                  }));
                }, 500);
              }
              obj.collected = true;
            } else {
              // Collect leaf or bamboo
              obj.collected = true;
              newState.score += obj.points || 1;
              newState.combo++;

              if (newState.combo >= 5) {
                // Combo bonus!
                newState.score += Math.floor(newState.combo / 5) * 2;
                newState.showCombo = true;
                newState.comboTime = newState.gameTime;
              }
            }
          }
        });
      }

      return newState;
    },
    [gameState, restartGame]
  );

  // Render unique backgrounds for each game template
  const renderBackground = useCallback((ctx: CanvasRenderingContext2D, config: any, state: GameState) => {
    switch (gameTemplate) {
      case 'car': {
        // Neon Racing Track - Dark road with neon edges and city skyline
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#0a0a1e'); // Dark blue night
        gradient.addColorStop(0.6, '#1a1a3e'); // Darker blue
        gradient.addColorStop(1, '#2a2a2a'); // Dark asphalt
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // City skyline silhouettes
        ctx.fillStyle = '#000814';
        const buildings = [
          {x: 0, h: 120}, {x: 120, h: 180}, {x: 280, h: 150}, 
          {x: 400, h: 200}, {x: 600, h: 160}, {x: 800, h: 190}
        ];
        buildings.forEach(building => {
          ctx.fillRect(building.x, 200 - building.h, 120, building.h);
          // Building windows
          ctx.fillStyle = '#ffff00';
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < Math.floor(building.h / 20); j++) {
              if (Math.random() > 0.6) {
                ctx.fillRect(building.x + 20 + i * 30, 200 - building.h + j * 20 + 5, 8, 10);
              }
            }
          }
          ctx.fillStyle = '#000814';
        });

        // Racing track with neon edges
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 100);
        
        // Neon track edges with animation
        const neonIntensity = 0.8 + Math.sin(state.gameTime * 3) * 0.2;
        ctx.strokeStyle = `rgba(0, 255, 255, ${neonIntensity})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(255, 0, 255, ${neonIntensity})`;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 100);
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 100);
        ctx.stroke();
        
        // Reset shadow for other elements
        ctx.shadowBlur = 0;
        break;
      }
      
      case 'football': {
        // Stadium atmosphere with crowd and field
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.4, '#98FB98'); // Light green
        gradient.addColorStop(1, '#228B22'); // Forest green
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Stadium stands with crowd
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 50, CANVAS_WIDTH, 80);
        ctx.fillStyle = '#654321';
        ctx.fillRect(0, 130, CANVAS_WIDTH, 20);
        
        // Animated crowd
        ctx.fillStyle = '#FF6B47';
        for (let i = 0; i < 40; i++) {
          const crowdX = i * 30 + (state.gameTime * 20) % 30;
          const crowdY = 80 + Math.sin(state.gameTime * 2 + i) * 5;
          ctx.fillRect(crowdX, crowdY, 8, 15);
        }
        
        // Football field with yard lines
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 100);
        
        // Yard lines
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        for (let i = 0; i <= CANVAS_WIDTH; i += 100) {
          ctx.beginPath();
          ctx.moveTo(i, GROUND_Y);
          ctx.lineTo(i, GROUND_Y + 100);
          ctx.stroke();
        }
        
        // Goal posts in distance
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH - 50, GROUND_Y - 60);
        ctx.lineTo(CANVAS_WIDTH - 50, GROUND_Y + 20);
        ctx.moveTo(CANVAS_WIDTH - 60, GROUND_Y - 60);
        ctx.lineTo(CANVAS_WIDTH - 40, GROUND_Y - 60);
        ctx.stroke();
        break;
      }
      
      case 'fighting': {
        // Urban alley with brick walls and graffiti
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#2F1B14'); // Dark brown
        gradient.addColorStop(0.6, '#8B4513'); // Saddle brown
        gradient.addColorStop(1, '#654321'); // Dark goldenrod
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Brick wall pattern
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 1;
        for (let y = 0; y < CANVAS_HEIGHT; y += 20) {
          for (let x = 0; x < CANVAS_WIDTH; x += 40) {
            const offset = (y % 40 === 0) ? 0 : 20;
            ctx.strokeRect(x + offset, y, 40, 20);
          }
        }
        
        // Graffiti tags
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FF0080';
        ctx.rotate(0.1);
        ctx.fillText('FIGHT', 100, 100);
        ctx.rotate(-0.2);
        ctx.fillStyle = '#00FF80';
        ctx.fillText('ZONE', 600, 120);
        ctx.rotate(0.1); // Reset rotation
        
        // Alley ground with debris
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 100);
        
        // Scattered debris and trash
        ctx.fillStyle = '#8B0000';
        for (let i = 0; i < 8; i++) {
          const debrisX = i * 150 + Math.sin(state.gameTime + i) * 20;
          const debrisY = GROUND_Y + 60 + Math.random() * 20;
          ctx.fillRect(debrisX, debrisY, 15, 8);
        }
        break;
      }
      
      case 'fighter_jet': {
        // Deep space nebula with stars and cosmic phenomena
        const gradient = ctx.createRadialGradient(
          CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 0,
          CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_WIDTH
        );
        gradient.addColorStop(0, '#1a0033'); // Deep purple
        gradient.addColorStop(0.5, '#000066'); // Navy blue
        gradient.addColorStop(1, '#000000'); // Black space
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Animated nebula clouds
        const nebulaColors = ['#FF00FF', '#00FFFF', '#FF0080', '#8000FF'];
        for (let i = 0; i < 4; i++) {
          const nebulaGradient = ctx.createRadialGradient(
            200 + i * 300 + Math.sin(state.gameTime * 0.5 + i) * 50,
            100 + i * 80 + Math.cos(state.gameTime * 0.3 + i) * 30,
            0,
            200 + i * 300 + Math.sin(state.gameTime * 0.5 + i) * 50,
            100 + i * 80 + Math.cos(state.gameTime * 0.3 + i) * 30,
            150
          );
          nebulaGradient.addColorStop(0, nebulaColors[i] + '40');
          nebulaGradient.addColorStop(1, nebulaColors[i] + '00');
          ctx.fillStyle = nebulaGradient;
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }

        // Twinkling stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 100; i++) {
          const starX = (i * 73 + state.gameTime * 10) % CANVAS_WIDTH;
          const starY = (i * 47) % CANVAS_HEIGHT;
          const twinkle = Math.sin(state.gameTime * 3 + i) * 0.5 + 0.5;
          ctx.globalAlpha = twinkle;
          ctx.fillRect(starX, starY, 2, 2);
        }
        ctx.globalAlpha = 1;
        
        // Distant planets
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - 100, 80, 25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(150, CANVAS_HEIGHT - 60, 35, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      
      case 'bird': {
        // Watercolor sky with soft clouds and nature
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#FFE4E1'); // Misty rose
        gradient.addColorStop(0.3, '#87CEEB'); // Sky blue  
        gradient.addColorStop(0.7, '#98FB98'); // Pale green
        gradient.addColorStop(1, '#90EE90'); // Light green
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Watercolor cloud effects
        const cloudColors = ['#FFFFFF80', '#F0F8FF80', '#E6E6FA80'];
        for (let i = 0; i < 6; i++) {
          const cloudX = (i * 200 + state.gameTime * 15) % (CANVAS_WIDTH + 200) - 100;
          const cloudY = 60 + i * 40 + Math.sin(state.gameTime * 0.8 + i) * 20;
          
          ctx.fillStyle = cloudColors[i % 3];
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, 40 + Math.sin(state.gameTime + i) * 10, 0, Math.PI * 2);
          ctx.arc(cloudX + 30, cloudY - 10, 35, 0, Math.PI * 2);
          ctx.arc(cloudX - 25, cloudY + 5, 30, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Flowing grass and flowers
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 100);
        
        // Animated flowers
        const flowerColors = ['#FF69B4', '#FFB6C1', '#FF1493', '#FFC0CB'];
        for (let i = 0; i < 15; i++) {
          const flowerX = i * 80 + Math.sin(state.gameTime * 2 + i) * 10;
          const flowerY = GROUND_Y + 20 + Math.cos(state.gameTime * 1.5 + i) * 5;
          
          ctx.fillStyle = flowerColors[i % 4];
          ctx.beginPath();
          ctx.arc(flowerX, flowerY, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Flower stem
          ctx.strokeStyle = '#228B22';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(flowerX, flowerY);
          ctx.lineTo(flowerX, flowerY + 25);
          ctx.stroke();
        }
        
        // Rainbow effect
        const rainbow = ctx.createLinearGradient(0, 100, CANVAS_WIDTH, 200);
        rainbow.addColorStop(0, '#FF000040');
        rainbow.addColorStop(0.16, '#FF800040');
        rainbow.addColorStop(0.33, '#FFFF0040');
        rainbow.addColorStop(0.5, '#00FF0040');
        rainbow.addColorStop(0.66, '#0080FF40');
        rainbow.addColorStop(0.83, '#8000FF40');
        rainbow.addColorStop(1, '#FF00FF40');
        
        ctx.fillStyle = rainbow;
        ctx.fillRect(0, 80, CANVAS_WIDTH, 120);
        break;
      }
      
      case 'santa': {
        // Christmas night scene with snow and northern lights
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#000080'); // Midnight blue
        gradient.addColorStop(0.3, '#191970'); // Midnight blue
        gradient.addColorStop(0.7, '#2F4F4F'); // Dark slate gray
        gradient.addColorStop(1, '#FFFFFF'); // Snow white
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Northern lights animation
        const auroraGradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 200);
        const auroraIntensity = Math.sin(state.gameTime * 2) * 0.3 + 0.4;
        auroraGradient.addColorStop(0, `rgba(0, 255, 0, ${auroraIntensity})`);
        auroraGradient.addColorStop(0.5, `rgba(0, 255, 255, ${auroraIntensity * 0.7})`);
        auroraGradient.addColorStop(1, `rgba(255, 0, 255, ${auroraIntensity})`);
        
        ctx.fillStyle = auroraGradient;
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.translate(CANVAS_WIDTH/2, 100 + i * 30);
          ctx.rotate(Math.sin(state.gameTime + i) * 0.1);
          ctx.fillRect(-CANVAS_WIDTH/2, -20, CANVAS_WIDTH, 40);
          ctx.restore();
        }

        // Falling snow animation
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
          const snowX = (i * 67 + state.gameTime * 30) % CANVAS_WIDTH;
          const snowY = (i * 43 + state.gameTime * 50) % CANVAS_HEIGHT;
          const snowSize = 2 + (i % 3);
          ctx.beginPath();
          ctx.arc(snowX, snowY, snowSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Christmas trees
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 8; i++) {
          const treeX = i * 150 + Math.sin(state.gameTime * 0.5 + i) * 20;
          const treeY = GROUND_Y - 80;
          
          // Tree trunk
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(treeX + 15, treeY + 60, 10, 30);
          
          // Tree layers
          ctx.fillStyle = '#228B22';
          for (let layer = 0; layer < 3; layer++) {
            ctx.beginPath();
            ctx.moveTo(treeX, treeY + layer * 20);
            ctx.lineTo(treeX + 20, treeY + 20 + layer * 20);
            ctx.lineTo(treeX + 40, treeY + layer * 20);
            ctx.closePath();
            ctx.fill();
          }
          
          // Star on top
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(treeX + 20, treeY - 10, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Snowy ground
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, GROUND_Y + 80, CANVAS_WIDTH, 20);
        break;
      }
    }
  }, [gameTemplate]);

  // Main game loop with proper timing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = (currentTime: number) => {
      const updatedState = updateGame(currentTime);
      setGameState(updatedState);
      
      const config = getGameConfig();

      // Render unique background based on game template
      renderBackground(ctx, config, updatedState);

      // Draw objects with exciting visuals
      updatedState.objects.forEach((obj) => {
        if (obj.collected) return;

        ctx.save();
        ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);

        // Get emoji for this object type
        let emoji = "❓"; // Default fallback
        let isObstacle = false;
        
        // Special handling for falling gifts
        if (obj.isGift) {
          emoji = "🎁";
        } else {
          // Find emoji from config
          for (const collectible of config.collectibles) {
            if (collectible.name === obj.type) {
              emoji = collectible.emoji;
              break;
            }
          }
          
          for (const obstacle of config.obstacles) {
            if (obstacle.name === obj.type) {
              emoji = obstacle.emoji;
              isObstacle = true;
              break;
            }
          }
        }

        if (obj.isGift) {
          // Falling gifts - simple rotation while falling
          const rotation = (obj.y * 0.01) % (Math.PI * 2);
          ctx.rotate(rotation);
          ctx.font = "20px Arial";
          ctx.textAlign = "center";
          ctx.fillText(emoji, 0, 5);
        } else if (isObstacle) {
          // Menacing obstacles with warning effect
          if (obj.x < 200) {
            ctx.shadowColor = "red";
            ctx.shadowBlur = 10;
          }
          const wobble =
            Math.sin(updatedState.gameTime * 8 + (obj.animationOffset || 0)) * 2;
          ctx.translate(wobble, 0);
          ctx.font = "25px Arial";
          ctx.textAlign = "center";
          ctx.fillText(emoji, 0, 5);
          ctx.shadowBlur = 0;
        } else {
          // Animated floating collectibles
          const float =
            Math.sin(updatedState.gameTime * 2 + (obj.animationOffset || 0)) * 3;
          ctx.translate(0, float);
          ctx.rotate(
            Math.sin(updatedState.gameTime + (obj.animationOffset || 0)) * 0.2
          );
          ctx.font = obj.y < GROUND_Y - 40 ? "20px Arial" : "25px Arial"; // Different sizes for floating vs ground items
          ctx.textAlign = "center";
          ctx.fillText(emoji, 0, 5);
        }

        ctx.restore();
      });

      // Draw panda with death/invulnerability states
      ctx.save();
      ctx.translate(
        updatedState.panda.x + updatedState.panda.width / 2,
        updatedState.panda.y + updatedState.panda.height / 2
      );

      // Invulnerability flashing effect
      if (updatedState.panda.invulnerable) {
        ctx.globalAlpha = Math.sin(updatedState.gameTime * 20) > 0 ? 0.3 : 1.0;
      }

      // Death effect
      if (updatedState.panda.isDead) {
        ctx.rotate(Math.PI); // Flip upside down
        ctx.globalAlpha = 0.5;
      } else if (updatedState.panda.isJumping) {
        ctx.rotate(updatedState.panda.animationFrame * 0.1);
      } else {
        ctx.translate(0, updatedState.panda.animationFrame * 2);
      }

      ctx.font = "45px Arial";
      ctx.textAlign = "center";
      ctx.fillText(config.player.emoji, 0, 10);
      ctx.restore();

      // Draw UI elements
      ctx.fillStyle = "#333";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${updatedState.score}`, 10, 25);
      ctx.fillText(`High: ${updatedState.highScore}`, 10, 45);
      ctx.fillText(`Lives: ${"❤️".repeat(updatedState.lives)}`, 10, 65);

      // Draw combo
      if (updatedState.showCombo && updatedState.combo >= 5) {
        ctx.fillStyle = "#FF6B6B";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${updatedState.combo}x COMBO!`, CANVAS_WIDTH / 2, 50);
      }

      // Draw game over screen
      if (updatedState.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = "#FF4444";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

        ctx.fillStyle = "#FFF";
        ctx.font = "20px Arial";
        ctx.fillText(
          `Final Score: ${updatedState.score}`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2
        );
        ctx.fillText(
          `High Score: ${updatedState.highScore}`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 25
        );
        ctx.fillText(
          "Restarting in " + Math.ceil(3 - updatedState.restartTimer) + "...",
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 55
        );
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [updateGame]);

  return (
    <div className="flex flex-col items-center gap-4 p-2 max-h-screen overflow-hidden">
      {/* Game Title and Instructions */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-neutral-800 mb-2">
          {getGameConfig().title}
        </h3>
        <p className="text-sm text-neutral-600 mb-2">
          <strong>🎯 Goal:</strong> {getGameConfig().goal}
        </p>
        <p className="text-xs text-neutral-500">
          <strong>Controls:</strong> {getGameConfig().controls} • Get 5+ combo for bonus points!
        </p>
      </div>

      {/* Game Canvas - Now fills 3/4 of screen */}
      <div className="relative w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-green-300 rounded-xl shadow-2xl bg-gradient-to-b from-sky-200 to-green-200 max-w-full h-auto"
          style={{
            width: "min(75vw, 1200px)",
            height: "min(45vh, 500px)",
            minWidth: "600px",
            minHeight: "300px",
            maxWidth: "1200px",
            maxHeight: "500px",
            outline: "none",
          }}
          tabIndex={0}
        />
      </div>

      {/* Enhanced Progress Section */}
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-medium text-neutral-700">
            🎮 Creating your incredible game...
          </span>
          <span className="text-base font-bold text-duo-blue-600">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-duo-green-500 via-duo-blue-500 to-duo-purple-500 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.max(progress, 5)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            <div className="absolute right-0 top-0 h-full w-1 bg-white opacity-60 animate-pulse"></div>
          </div>
        </div>

        <div className="text-center mt-3">
          <p className="text-sm text-neutral-600 font-medium">
            {progress < 10
              ? "🌱 Planting the seeds of your game world..."
              : progress < 20
              ? "🏗️ Building the foundation and game structure..."
              : progress < 30
              ? "🎨 Painting beautiful backgrounds and environments..."
              : progress < 40
              ? "👾 Creating characters and bringing them to life..."
              : progress < 50
              ? "⚡ Adding special powers and abilities..."
              : progress < 60
              ? "🎵 Composing sound effects and music..."
              : progress < 70
              ? "🔧 Programming game logic and interactions..."
              : progress < 80
              ? "🌟 Adding sparkles, animations, and magic..."
              : progress < 90
              ? "🎮 Testing gameplay and fine-tuning controls..."
              : progress < 95
              ? "✨ Polishing every detail to perfection..."
              : "🎉 Your amazing game is ready to play!"}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {progress < 50
              ? "Play the panda game above while we work! Avoid the rocks! 🐼"
              : progress < 90
              ? "Almost there! Try to beat your high score! 🏆"
              : "Get ready for an amazing gaming experience! 🚀"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZambooLoaderGame;
