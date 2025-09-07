// Auto-tests for Zamboo Game Engine
// Validates game quality, playability, and educational value

import { createZambooGame, calculateGameQuality, validateAndImproveGame } from '../zambooEngine'
import { validateGameSpec } from '../../types/gamespec'

// Test cases covering different scenarios
const TEST_PROMPTS = [
  {
    prompt: "Create a car racing game",
    ageGroup: "8-10" as const,
    difficulty: "medium" as const,
    expectedTemplate: "endless-runner",
    expectedTheme: "forest" // Default when no clear theme
  },
  {
    prompt: "Make a game where I collect stars in space",
    ageGroup: "7-9" as const,
    difficulty: "easy" as const,
    expectedTemplate: "top-down-collector",
    expectedTheme: "space"
  },
  {
    prompt: "Create a jumping platform game with fish underwater",
    ageGroup: "10-12" as const,
    difficulty: "hard" as const,
    expectedTemplate: "platformer",
    expectedTheme: "ocean"
  },
  {
    prompt: "Simple collecting game for young kids",
    ageGroup: "4-6" as const,
    difficulty: "easy" as const,
    expectedTemplate: "top-down-collector",
    expectedTheme: "forest"
  }
]

describe('Zamboo Engine Auto-Tests', () => {
  
  describe('Game Assembly Tests', () => {
    TEST_PROMPTS.forEach((testCase, index) => {
      test(`Test ${index + 1}: ${testCase.prompt}`, () => {
        const result = createZambooGame(
          testCase.prompt,
          testCase.ageGroup,
          testCase.difficulty
        )
        
        // Validate GameSpec structure
        expect(validateGameSpec(result.gameSpec)).not.toBeNull()
        expect(result.gameSpec.template).toBe(testCase.expectedTemplate)
        expect(result.gameSpec.themePack).toBe(testCase.expectedTheme)
        expect(result.gameSpec.ageGroup).toBe(testCase.ageGroup)
        expect(result.gameSpec.difficulty).toBe(testCase.difficulty)
        
        // Validate GameLogic compatibility
        expect(result.gameLogic.title).toBe(result.gameSpec.title)
        expect(result.gameLogic.objects.length).toBeGreaterThan(2) // At least player + collectibles
        expect(result.gameLogic.events.length).toBeGreaterThan(0)
        
        // Validate quality metrics
        expect(result.qualityMetrics.overallScore).toBeGreaterThan(60) // Minimum quality threshold
        expect(result.qualityMetrics.educationalValue).toBeGreaterThan(50)
        expect(result.qualityMetrics.ageAppropriate).toBeGreaterThan(70)
        
        console.log(`✅ Test ${index + 1} passed:`, {
          title: result.gameSpec.title,
          quality: result.qualityMetrics.overallScore,
          template: result.gameSpec.template,
          theme: result.gameSpec.themePack
        })
      })
    })
  })

  describe('Quality Validation Tests', () => {
    test('High-quality games should score above 80', () => {
      const result = createZambooGame(
        "Create an amazing space adventure where you collect magical stars",
        "8-10",
        "medium"
      )
      
      expect(result.qualityMetrics.overallScore).toBeGreaterThan(80)
      expect(result.qualityMetrics.funFactor).toBeGreaterThan(75)
      expect(result.qualityMetrics.educationalValue).toBeGreaterThan(70)
    })

    test('Age-appropriate content validation', () => {
      // Test for 4-6 age group
      const youngKidsGame = createZambooGame(
        "Simple treasure hunt game",
        "4-6",
        "easy"
      )
      
      expect(youngKidsGame.gameSpec.template).toBe("top-down-collector") // Simplest template
      expect(youngKidsGame.gameSpec.winTarget).toBeLessThanOrEqual(8) // Not too many items
      expect(youngKidsGame.qualityMetrics.ageAppropriate).toBeGreaterThan(80)
      
      // Test for 10-12 age group
      const olderKidsGame = createZambooGame(
        "Complex adventure game",
        "10-12",
        "hard"
      )
      
      expect(olderKidsGame.gameSpec.codingConcepts.length).toBeGreaterThanOrEqual(2)
      expect(olderKidsGame.qualityMetrics.educationalValue).toBeGreaterThan(70)
    })

    test('Template selection accuracy', () => {
      const jumpGame = createZambooGame("jumping platform game", "8-10", "medium")
      expect(jumpGame.gameSpec.template).toBe("platformer")
      
      const runGame = createZambooGame("endless running game", "8-10", "medium")
      expect(runGame.gameSpec.template).toBe("endless-runner")
      
      const collectGame = createZambooGame("collect treasure game", "6-8", "easy")
      expect(collectGame.gameSpec.template).toBe("top-down-collector")
    })

    test('Theme selection accuracy', () => {
      const spaceGame = createZambooGame("space rocket adventure", "8-10", "medium")
      expect(spaceGame.gameSpec.themePack).toBe("space")
      
      const oceanGame = createZambooGame("underwater fish collecting", "7-9", "easy")
      expect(oceanGame.gameSpec.themePack).toBe("ocean")
      
      const forestGame = createZambooGame("magical forest quest", "8-10", "medium")
      expect(forestGame.gameSpec.themePack).toBe("forest")
    })
  })

  describe('Performance and Validation Tests', () => {
    test('Game assembly performance', () => {
      const startTime = performance.now()
      
      const result = createZambooGame(
        "Create a fun adventure game",
        "7-9",
        "medium"
      )
      
      const endTime = performance.now()
      const assemblyTime = endTime - startTime
      
      // Assembly should be fast (under 100ms for local processing)
      expect(assemblyTime).toBeLessThan(100)
      expect(result.gameSpec).toBeDefined()
      expect(result.gameLogic).toBeDefined()
      
      console.log(`⚡ Assembly time: ${assemblyTime.toFixed(2)}ms`)
    })

    test('Game validation and improvement', () => {
      const result = createZambooGame(
        "space collecting game",
        "6-8",
        "easy"
      )
      
      const validation = validateAndImproveGame(result.gameSpec, result.gameLogic)
      
      expect(validation.criticalIssues.length).toBe(0) // No critical issues
      expect(validation.suggestions).toBeDefined()
      
      // Games should generally not need critical improvements if engine works correctly
      console.log('🔍 Validation results:', {
        improved: validation.improved,
        suggestions: validation.suggestions.length,
        critical: validation.criticalIssues.length
      })
    })

    test('Educational value validation', () => {
      const educationalGame = createZambooGame(
        "programming logic game with loops and conditions",
        "10-12",
        "medium"
      )
      
      expect(educationalGame.gameSpec.codingConcepts.length).toBeGreaterThanOrEqual(2)
      expect(educationalGame.gameSpec.learningObjectives.length).toBeGreaterThan(0)
      expect(educationalGame.qualityMetrics.educationalValue).toBeGreaterThan(75)
      
      // Check that coding concepts are appropriate
      const validConcepts = ['loops', 'conditions', 'events', 'variables', 'functions', 'movement', 'collision', 'scoring']
      educationalGame.gameSpec.codingConcepts.forEach(concept => {
        expect(validConcepts).toContain(concept)
      })
    })
  })

  describe('Stress Tests', () => {
    test('Handle edge case prompts', () => {
      const edgeCases = [
        { prompt: "", ageGroup: "7-9" as const, difficulty: "medium" as const },
        { prompt: "game", ageGroup: "4-6" as const, difficulty: "easy" as const },
        { prompt: "super complex advanced difficult game", ageGroup: "10-12" as const, difficulty: "hard" as const }
      ]
      
      edgeCases.forEach((edgeCase, index) => {
        expect(() => {
          const result = createZambooGame(
            edgeCase.prompt,
            edgeCase.ageGroup,
            edgeCase.difficulty
          )
          
          // Should still produce valid games
          expect(result.gameSpec.title.length).toBeGreaterThan(0)
          expect(result.gameLogic.objects.length).toBeGreaterThan(1)
          expect(result.qualityMetrics.overallScore).toBeGreaterThan(50)
          
        }).not.toThrow()
        
        console.log(`🧪 Edge case ${index + 1} handled successfully`)
      })
    })

    test('Consistency across multiple generations', () => {
      const prompt = "space adventure collecting stars"
      const results = []
      
      // Generate same prompt multiple times
      for (let i = 0; i < 5; i++) {
        results.push(createZambooGame(prompt, "8-10", "medium"))
      }
      
      // All should have same template and theme (consistency)
      const templates = results.map(r => r.gameSpec.template)
      const themes = results.map(r => r.gameSpec.themePack)
      
      expect(new Set(templates).size).toBe(1) // All same template
      expect(new Set(themes).size).toBe(1) // All same theme
      
      // But titles can vary for variety
      const titles = results.map(r => r.gameSpec.title)
      console.log('🎯 Generated titles:', titles)
      
      // Quality should be consistent
      results.forEach(result => {
        expect(result.qualityMetrics.overallScore).toBeGreaterThan(70)
      })
    })
  })

  describe('Integration Tests', () => {
    test('Full pipeline: Prompt → GameSpec → GameLogic → Quality', () => {
      const testPrompt = "Create a magical forest adventure where you jump on platforms and collect golden coins"
      
      // Step 1: Generate game
      const result = createZambooGame(testPrompt, "8-10", "medium")
      
      // Step 2: Verify GameSpec
      expect(result.gameSpec.template).toBe("platformer")
      expect(result.gameSpec.themePack).toBe("forest")
      expect(result.gameSpec.title).toContain("Forest" || "Magical" || "Platform")
      
      // Step 3: Verify GameLogic conversion
      expect(result.gameLogic.objects.some(obj => obj.type === "player")).toBe(true)
      expect(result.gameLogic.objects.some(obj => obj.type === "collectible")).toBe(true)
      expect(result.gameLogic.events.some(event => event.trigger === "collision")).toBe(true)
      
      // Step 4: Verify quality metrics
      expect(result.qualityMetrics.overallScore).toBeGreaterThan(75)
      expect(result.qualityMetrics.details.templateMatch).toBeGreaterThan(80)
      expect(result.qualityMetrics.details.themeConsistency).toBeGreaterThan(80)
      
      // Step 5: Verify metadata
      expect(result.metadata.template).toBe("platformer")
      expect(result.metadata.themePack).toBe("forest")
      expect(result.metadata.prompt).toBe(testPrompt)
      expect(result.metadata.optimizations.length).toBeGreaterThan(0)
      
      console.log('🎉 Full pipeline test completed:', {
        title: result.gameSpec.title,
        template: result.gameSpec.template,
        theme: result.gameSpec.themePack,
        quality: result.qualityMetrics.overallScore,
        optimizations: result.metadata.optimizations.length
      })
    })
  })
})

// Export test utilities for external testing
export {
  TEST_PROMPTS
}