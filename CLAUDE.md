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
# E2E testing is done manually with test-game-generation.js and e2e-test.js
# Playwright tests available for game generation validation
```

## Architecture Overview

Zamboo is an educational coding platform where kids create games through natural language prompts. The architecture follows Next.js 14 App Router patterns with dual game generation systems:

### Dual Game Generation Flow
1. **Input Processing** (`src/app/create/`) - Kids describe games via voice/text with Web Speech API integration
2. **AI Generation** - Two parallel systems:
   - **GameSpec System** (`src/app/api/generateGame/route.ts`) - DeepSeek API converts prompts to structured GameLogic JSON
   - **HTML Game System** (`src/app/api/generateHTMLGame/route.ts`) - Creates self-contained HTML games with inline CSS/JS
3. **Schema Validation** (`src/lib/gameLogicSchema.ts`) - Zod schemas ensure valid game structure
4. **Game Rendering** - Dual rendering paths:
   - **Phaser.js Engine** (`src/components/game/GameEngine.tsx`) - Renders GameLogic JSON games
   - **HTML Iframe** - Renders self-contained HTML games in sandboxed iframes

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

**Voice Input System** (`src/app/create/page.tsx`)
- Web Speech API integration for voice-to-text conversion
- Browser compatibility checks (Chrome, Safari, Edge)
- Real-time microphone input with error handling
- Automatic prompt population from voice transcription

**Dual Rendering Systems**:
- **Phaser Integration** (`src/components/game/GameEngine.tsx`) - React wrapper for Phaser.js engine
- **HTML Games** (`src/app/game/page.tsx`) - Sandboxed iframe rendering for self-contained HTML games

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

**API Routes** (`src/app/api/`)
- **GameLogic Generation** (`generateGame/route.ts`) - Processes natural language prompts into GameLogic JSON
- **HTML Game Generation** (`generateHTMLGame/route.ts`) - Creates self-contained HTML files with inline CSS/JS
- Uses comprehensive system prompt with safety guidelines
- Validates AI output against schema
- Provides fallback games when AI generation fails
- Requires `DEEPSEEK_API_KEY` environment variable

**Safety System**
- Content filtering for family-friendly games only
- Age-appropriate complexity matching (4-6, 7-9, 10-12)
- Educational focus on coding concepts
- Zamboo's encouraging, positive personality

## Development Notes

### Voice Input Implementation
The Web Speech API integration allows kids to create games by speaking:

**Voice Flow:**
1. User clicks microphone button in create view
2. Browser requests microphone permission
3. Web Speech API begins listening for speech
4. Real-time transcription populates the text input
5. User can continue speaking or stop to generate game

**Key Functions:**
- `startListening()` - Initializes Web Speech Recognition with error handling
- `stopListening()` - Cleanly terminates voice input
- Browser compatibility checks for Chrome/Safari/Edge
- Comprehensive error handling for permissions, network, and audio issues

### HTML Game Generation System
Self-contained HTML games with inline styling and JavaScript:

**HTML Game Flow:**
1. User prompt processed by `/api/generateHTMLGame`
2. DeepSeek creates complete HTML file with embedded CSS/JS
3. Canvas-based rendering using requestAnimationFrame
4. Touch and keyboard input support
5. Game rendered in sandboxed iframe for security

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
- Multiple JSON extraction strategies in `generateGame/route.ts`
- Comprehensive fallback system when AI parsing fails
- Schema validation with detailed error logging
- Automatic content cleanup and markdown removal for HTML games

### Game Engine Architecture  
- Phaser.js integration through React component wrapper
- Real-time physics simulation with configurable properties
- Dynamic object creation from GameLogic JSON schema
- Particle effects and animation system
- Dual rendering: Phaser games vs HTML iframe games

### Voice Input Architecture
- Web Speech API with cross-browser compatibility
- Real-time error handling and user feedback
- Microphone permission management
- Automatic text field population from speech

### Environment Variables
- `DEEPSEEK_API_KEY` - Required for AI game generation
- Templates work without API key (offline mode)
- No `.env.example` file currently exists in repo

### Key UI/UX Features
- Responsive layout optimized for minimal viewport space
- Voice-to-text input with visual feedback
- Kid-friendly example prompts (simple animals, familiar concepts)
- Compact design with reduced padding/margins for better fit
- Duolingo-inspired design patterns with vibrant colors

The codebase emphasizes educational value, safety, and kid-friendly design while maintaining technical robustness through comprehensive schema validation and fallback systems. Recent additions include voice input functionality and HTML game generation for broader compatibility.