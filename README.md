# 🐼 Zamboo - Code Games with a Funky Panda

> Kids team up with **Zamboo the Funky Panda** to create games through vibecoding!

![Zamboo](https://img.shields.io/badge/Made%20with-Love%20%26%20Bamboo-green?style=for-the-badge&logo=heart)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Phaser](https://img.shields.io/badge/Phaser-3.80-orange?style=for-the-badge&logo=phaser)

## 🌟 Vision

Zamboo is an educational coding platform where kids create games by speaking or typing their ideas. Zamboo the Funky Panda calls the **DeepSeek API** to turn their prompts into structured **GameLogic JSON**, which a Phaser.js engine renders as fun, animated canvas games.

Kids learn coding concepts (loops, events, conditions) through gameplay and can edit their games using **Scratch-style visual blocks**.

## ✨ Features

### 🐼 **Zamboo the Mascot**
- Animated panda companion on every page
- Contextual reactions (cheers for wins, encourages retries)
- Educational explanations in kid-friendly language
- Interactive speech bubbles and animations

### 🎮 **Game Creation**
- **Voice & Text Input**: Describe games naturally or use speech recognition
- **AI-Powered**: DeepSeek API converts ideas to playable games
- **Safe Content**: All games validated for family-friendly content
- **Instant Play**: Games render immediately in browser

### 🎯 **Educational Focus**
- **Coding Concepts**: Loops, conditions, events, variables, functions
- **Age-Appropriate**: Content tailored to different age groups (5-7, 8-10, 11-13, 14+)
- **Visual Learning**: Concept cards explain programming ideas simply
- **Hands-On**: Learn by creating and playing

### 🛠️ **Game Engine**
- **Phaser.js**: Professional 2D game framework
- **Rich Graphics**: Particles, animations, parallax backgrounds
- **Physics**: Realistic movement and collisions  
- **Responsive**: Works on desktop, tablet, and mobile

### 📱 **PWA Support**
- **Offline Play**: Templates work without internet
- **Install**: Add to home screen on any device
- **Background Sync**: Save games when connection returns
- **Fast Loading**: Cached resources for instant access

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **DeepSeek API Key** (optional - templates work without it)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd zamboo

# Install dependencies
npm install

# Set up environment (optional)
cp .env.example .env.local
# Add your DEEPSEEK_API_KEY to .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start creating games with Zamboo! 🎉

## 🏗️ Project Structure

```
zamboo/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── create/            # Game creation page
│   │   ├── templates/         # Template gallery
│   │   ├── game/              # Game player page
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── zamboo/           # Mascot components
│   │   ├── game/             # Game engine components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                  # Utilities and schemas
│   │   ├── gameLogicSchema.ts # Zod validation schemas
│   │   └── gameGenerator.ts   # Game creation utilities
│   └── types/                # TypeScript definitions
├── public/                   # Static assets
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker
│   └── icons/              # App icons
└── docs/                   # Documentation
```

## 🎯 Game Templates

Zamboo comes with built-in templates that work offline:

### 🌟 **Star Collector** (Ages 5-7)
- Collect golden stars in a space setting
- **Concepts**: Loops, Events
- **Difficulty**: Easy

### 🎋 **Bamboo Maze** (Ages 8-10) 
- Navigate through bamboo maze puzzles
- **Concepts**: Conditions, Logic
- **Difficulty**: Medium

### 🚀 **Rocket Adventure** (Ages 5-7)
- Pilot rockets and collect space gems
- **Concepts**: Physics, Events  
- **Difficulty**: Easy

### 🐼 **Panda Platformer** (Ages 8-10)
- Jump on platforms and collect bamboo
- **Concepts**: Physics, Conditions, Loops
- **Difficulty**: Medium

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:

```env
# DeepSeek API (optional - for AI game generation)
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Zamboo
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Game Logic Schema

Games are defined using a comprehensive JSON schema with:

- **World Settings**: Size, background, camera
- **Game Objects**: Players, collectibles, obstacles, platforms
- **Events**: Collision detection, scoring, win/lose conditions
- **Physics**: Gravity, friction, bounce, mass
- **Educational Content**: Coding concepts and explanations
- **Zamboo Personality**: Custom dialogue and reactions

Example game structure:

```typescript
{
  "id": "star_collector_123",
  "title": "Space Star Adventure", 
  "description": "Collect all the stars in outer space!",
  "difficulty": "easy",
  "ageGroup": "5-7",
  "worldSize": { "width": 800, "height": 600 },
  "objects": [
    {
      "id": "player",
      "type": "player", 
      "sprite": { "type": "circle", "color": "#FF6B9D" },
      "position": { "x": 50, "y": 300 },
      "physics": { "gravity": 0, "friction": 0.95 }
    }
  ],
  "events": [
    {
      "trigger": "collision",
      "actions": [
        { "type": "score", "value": 10 },
        { "type": "destroy", "targetId": "star_1" }
      ]
    }
  ],
  "concepts": [
    {
      "name": "Events",
      "description": "When something happens, like collecting a star!",
      "examples": ["Touch star → get points!"]
    }
  ],
  "zambooDialogue": {
    "welcome": "Hi! Let's collect stars together! 🐼⭐",
    "victory": "Amazing! You're a star collector champion! 🌟"
  }
}
```

## 🛡️ Safety & Content Filtering

Zamboo prioritizes child safety:

- **Content Validation**: All AI-generated games screened for appropriate content
- **No Personal Data**: No personal information collected or stored
- **Family-Friendly**: Violence, weapons, and scary content automatically filtered
- **Age-Appropriate**: Content complexity matched to specified age groups
- **Positive Messaging**: Zamboo always encourages and supports learning

## 🎨 Customization

### Adding New Templates

1. Create your game logic in `src/lib/gameGenerator.ts`
2. Add template metadata to `getAvailableTemplates()`
3. Include educational concepts and Zamboo dialogue
4. Test across different age groups

### Extending the Mascot

Zamboo's personality can be customized:

```typescript
// Custom Zamboo moods and animations
const customZambooState = {
  mood: 'excited',      // happy, excited, thinking, celebrating, encouraging
  animation: 'dance',   // idle, dance, jump, clap, thinking, float
  message: 'Custom message here!'
}
```

### Adding Game Concepts

Educational concepts are defined in the schema:

```typescript
const newConcept = {
  id: 'functions',
  name: 'Functions', 
  description: 'Reusable blocks of code that do specific tasks!',
  examples: ['Jump function makes character jump!'],
  difficulty: 'intermediate',
  category: 'functions'
}
```

## 📱 PWA Installation

Zamboo works as a Progressive Web App:

1. **Desktop**: Click install icon in address bar
2. **Mobile**: Tap "Add to Home Screen" in browser menu
3. **Offline**: Templates and saved games work without internet
4. **Updates**: Automatic updates when new versions available

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm run dev
npm run build
npm run lint

# Submit pull request
git push origin feature/amazing-feature
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: Consistent formatting
- **Accessibility**: WCAG 2.1 AA compliance
- **Testing**: Jest + React Testing Library (coming soon)

## 🔮 Roadmap

### Phase 1 - MVP (Current)
- ✅ Core game engine and templates
- ✅ Zamboo mascot and AI integration  
- ✅ PWA support and offline play
- ✅ Voice input and game creation

### Phase 2 - Enhanced Learning
- 🔄 Visual block editor (Blockly integration)
- 🔄 Advanced game templates
- 🔄 Progress tracking and achievements
- 🔄 Multiplayer games

### Phase 3 - Community
- 📋 Share and remix games
- 📋 Teacher dashboard and classroom mode
- 📋 Advanced coding concepts (functions, variables)
- 📋 3D game support

### Phase 4 - Platform Expansion
- 📋 Mobile native apps
- 📋 VR/AR game creation
- 📋 Advanced AI features
- 📋 Multi-language support

## 🆘 Troubleshooting

### Common Issues

**Game won't load?**
- Check browser console for errors
- Ensure localStorage is enabled
- Try refreshing the page

**Voice input not working?**
- Use HTTPS (required for speech recognition)
- Grant microphone permissions
- Check browser compatibility

**API errors?**
- Verify DEEPSEEK_API_KEY in environment
- Check network connectivity
- Templates work without API

**Performance issues?**
- Close other browser tabs
- Use latest browser version
- Enable hardware acceleration

### Browser Support

- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

Mobile browsers fully supported with touch controls.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DeepSeek**: AI-powered game generation
- **Phaser.js**: Amazing 2D game framework  
- **Next.js**: React framework for production
- **Framer Motion**: Smooth animations
- **All the kids**: Who inspire us to make coding fun! 🌟

---

## 🎉 Ready to Code with Zamboo?

```bash
npm install && npm run dev
```

Visit localhost:3000 and let Zamboo guide you on your coding adventure! 🐼✨

Remember: Every great programmer started as a curious kid. Let's make coding magical! 🪄

---

*Made with ❤️ and 🎋 by the Zamboo team*