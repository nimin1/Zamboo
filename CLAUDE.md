# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server on localhost:3000
npm run build      # Build production version
npm start          # Start production server
npm run lint       # Run ESLint checks
```

### Environment Setup
```bash
npm install        # Install dependencies
cp .env.example .env.local  # Set up environment variables (optional)
```

### Testing
```bash
# No testing framework currently configured
# E2E testing appears to be done manually with test-game-generation.js and e2e-test.js
```

## Architecture Overview

Zamboo is an educational coding platform where kids create games through natural language prompts. The architecture follows Next.js 14 App Router patterns with these core systems:

### Game Creation Flow
1. **Input Processing** (`src/app/create/`) - Kids describe games via text/voice
2. **AI Generation** (`src/app/api/generateGame/route.ts`) - DeepSeek API converts prompts to structured game logic
3. **Schema Validation** (`src/lib/gameLogicSchema.ts`) - Zod schemas ensure valid game structure
4. **Game Rendering** (`src/components/game/GameEngine.tsx`) - Phaser.js renders games from JSON

### Core Systems

**GameLogic Schema** (`src/lib/gameLogicSchema.ts`)
- Comprehensive Zod schema defining all game elements
- Covers: game objects, physics, events, animations, educational concepts
- Provides type safety and validation for AI-generated content
- Template helpers for common game patterns (collector, maze)

**Game Generator** (`src/lib/gameGenerator.ts`)
- Creates games from templates or AI prompts
- Manages built-in templates: Star Collector, Bamboo Maze, Rocket Adventure, Panda Platformer
- Fallback system when AI generation fails

**Phaser Integration** (`src/components/game/GameEngine.tsx`)
- React component wrapping Phaser.js game engine
- Converts GameLogic JSON to playable games
- Handles game state, scoring, and completion events

**Zamboo Mascot** (`src/components/zamboo/`)
- Animated panda companion with contextual reactions
- Educational explanations and encouragement
- Personality-driven dialogue system

### Key Data Structures

**GameLogic** - Main game definition containing:
- Basic info: title, description, difficulty, age group
- World: size, background, camera settings
- Objects: players, collectibles, obstacles, platforms
- Events: collision detection, scoring, win/lose conditions
- Educational: coding concepts with kid-friendly explanations
- Zamboo: personality-driven dialogue and reactions

**Game Templates** - Pre-built games covering different concepts:
- Easy (5-7): Star Collector, Rocket Adventure (loops, events)
- Medium (8-10): Bamboo Maze, Panda Platformer (conditions, physics)

### DeepSeek AI Integration

**API Route** (`src/app/api/generateGame/route.ts`)
- Processes natural language prompts into GameLogic JSON
- Uses comprehensive system prompt with safety guidelines
- Validates AI output against schema
- Provides fallback games when AI generation fails
- Requires `DEEPSEEK_API_KEY` environment variable

**Safety System**
- Content filtering for family-friendly games only
- Age-appropriate complexity matching
- Educational focus on coding concepts
- Zamboo's encouraging, positive personality

## Development Notes

### Adding New Game Templates
1. Create template function in `GameGenerator.createXXXTemplate()`
2. Add to `getAvailableTemplates()` array
3. Include educational concepts and Zamboo dialogue
4. Test across different age groups

### Modifying GameLogic Schema
- Update Zod schemas in `src/lib/gameLogicSchema.ts`
- Regenerate TypeScript types automatically
- Update AI system prompt to match new schema
- Test with both template and AI-generated games

### Phaser Game Development
- Game engine expects specific object types: player, collectible, obstacle, platform, goal
- Physics system supports gravity, friction, bounce, mass
- Events trigger on collision, timer, keypress, click, score thresholds
- Animations include: bounce, spin, float, pulse, wiggle, grow, fade

### TypeScript Configuration
- Strict mode enabled
- Path aliases: `@/*` maps to `./src/*`
- Includes Phaser.js, Zod, Framer Motion, Lucide React

### PWA Support
- Service worker (`public/sw.js`) for offline gameplay
- Manifest (`public/manifest.json`) for app installation
- Templates work offline, AI generation requires internet

### Styling & UI Framework
- **Tailwind CSS** with custom design system
- Custom color palette: duo-green, duo-blue, zamboo, panda, funky colors
- Font families: Poppins (sans), Fredoka One (display/fun), Schoolbell (playful)
- Custom animations: bounce-slow, wiggle, float, pulse-slow, scale
- Child-friendly, vibrant design following Duolingo-inspired patterns

### File Structure Overview
```
src/
├── app/                    # Next.js 14 App Router pages
│   ├── page.tsx           # Landing page
│   ├── create/            # Game creation interface
│   ├── game/              # Game player page  
│   ├── templates/         # Template gallery
│   └── api/               # API routes (DeepSeek integration)
├── components/            # React components
│   ├── zamboo/           # Mascot components
│   ├── game/             # Game engine & containers
│   └── ui/               # Reusable UI components
├── lib/                  # Core utilities
│   ├── gameLogicSchema.ts # Zod schemas & types
│   └── gameGenerator.ts   # Template creation logic
└── types/                # TypeScript definitions
```

## Important Implementation Notes

### AI Generation Error Handling
- Multiple JSON extraction strategies in `generateGame/route.ts`:657-420
- Comprehensive fallback system when AI parsing fails
- Schema validation with detailed error logging

### Game Engine Architecture  
- Phaser.js integration through React component wrapper
- Real-time physics simulation with configurable properties
- Dynamic object creation from GameLogic JSON schema
- Particle effects and animation system

### Environment Variables
- `DEEPSEEK_API_KEY` - Required for AI game generation
- Templates work without API key (offline mode)
- No `.env.example` file currently exists in repo

The codebase emphasizes educational value, safety, and kid-friendly design while maintaining technical robustness through comprehensive schema validation and fallback systems.