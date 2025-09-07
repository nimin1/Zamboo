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

Zamboo is a creative, evolving educational platform where kids aged 4-12 create and evolve games through natural language voice/text prompts. Kids can continuously add new elements to their games, save their creations, and learn programming through play. The architecture follows Next.js 14 App Router patterns with these core systems:

### Creative Evolution Flow
1. **Voice/Text Input** (`src/app/create/`) - Kids describe games via microphone or text input
2. **Child-Focused AI** (`src/app/api/generateGame/route.ts`) - DeepSeek API converts kid prompts to magical game worlds
3. **Game Evolution** - Kids can add "more colors", "add a friend", "make them fly" to evolve existing games
4. **Schema Validation** (`src/lib/gameLogicSchema.ts`) - Flexible Zod schemas support unlimited creativity
5. **Game Rendering** (`src/components/game/GameEngine.tsx`) - Phaser.js renders evolving games with sparkles and joy
6. **Save & Share** - Kids can save evolved games and return to them later

### Core Systems

**Evolution-Ready GameLogic Schema** (`src/lib/gameLogicSchema.ts`)
- Flexible Zod schema supporting unlimited creative game elements
- Evolution tracking: tracks child requests, game history, and save timestamps
- Child-friendly concepts: princesses, animals, dinosaurs, space adventures
- Scratch-style blocks: visual programming elements kids can understand
- Template helpers for kid-beloved patterns (princess castle, dino world, space adventure)

**Child-Focused Game Generator** (`src/lib/gameGenerator.ts`)
- Creates magical worlds from kid voice/text prompts
- Evolution system: `evolveExistingGame()` adds new elements to existing games
- Kid-beloved templates: Princess Castle, Dino Adventure, Space Explorer, Animal Friends
- Child-safe fallback system with magical themes and bright colors

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

### Child-Focused AI Integration

**Evolution-Ready API** (`src/app/api/generateGame/route.ts`)
- **NEW**: Processes child voice/text into magical, evolving games
- **NEW**: Game evolution system - adds elements to existing games instead of replacing them
- **NEW**: Child-psychology aware prompts focusing on ages 4-12
- **NEW**: Scratch-style visual programming integration
- Enhanced safety system with zero violence, bright colors, happy themes
- Requires `DEEPSEEK_API_KEY` environment variable

**Child Safety & Learning System**
- **NEW**: Age bands updated to 4-6, 7-9, 10-12 for better targeting
- **NEW**: Evolution tracking with save/restore capabilities  
- **NEW**: Visual programming concepts integrated through play
- **NEW**: Creative empowerment - every child idea gets incorporated
- Zero violence, always positive and encouraging themes

## Development Notes

### Game Evolution System (NEW!)
The evolution system allows kids to continuously enhance their games:

**Evolution Flow:**
1. Child creates initial game: "I want a cat game"
2. AI creates magical cat collecting fish
3. Child adds: "Add a dog friend!" 
4. System calls `evolveExistingGame()` to add dog companion to existing world
5. Child continues: "Make them fly!"
6. System adds flying abilities to both cat and dog
7. All changes are tracked in `evolutionHistory` and `childRequests` arrays

**Key Functions:**
- `createChildMagicalGame()` - Creates initial kid-focused game
- `evolveExistingGame()` - Adds new elements to existing games  
- Evolution tracking via `evolutionStage`, `parentGameId`, `saveTimestamp`
- Visual programming blocks auto-generated for each evolution

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