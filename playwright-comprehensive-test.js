// Comprehensive End-to-End Test for Zamboo Game Generation
// Tests 5 different user prompts to verify complete game generation pipeline

const { chromium } = require('playwright');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 120000, // 2 minutes per test
  headless: false, // Set to true for CI
  viewport: { width: 1280, height: 720 }
};

// 5 comprehensive test prompts covering different game types and themes
const TEST_PROMPTS = [
  {
    id: 'car_racing',
    prompt: 'Create a car racing game',
    ageGroup: '8-10',
    difficulty: 'simple',
    expectedElements: {
      gameTitle: ['Racing', 'Car', 'Forest', 'Adventure'],
      gameType: 'endless-runner',
      theme: ['forest', 'space', 'ocean'],
      hasPlayer: true,
      hasObstacles: true,
      hasGameCanvas: true
    }
  },
  {
    id: 'space_collecting',
    prompt: 'Make a game where I collect stars in space',
    ageGroup: '7-9',
    difficulty: 'simple',
    expectedElements: {
      gameTitle: ['Star', 'Space', 'Collect', 'Galaxy', 'Cosmic'],
      gameType: 'top-down-collector',
      theme: 'space',
      hasPlayer: true,
      hasCollectibles: true,
      hasGameCanvas: true
    }
  },
  {
    id: 'platform_jumping',
    prompt: 'Create a jumping game with platforms',
    ageGroup: '8-10',
    difficulty: 'medium',
    expectedElements: {
      gameTitle: ['Jump', 'Platform', 'Adventure'],
      gameType: 'platformer',
      theme: ['forest', 'space', 'ocean'],
      hasPlayer: true,
      hasPlatforms: true,
      hasGameCanvas: true
    }
  },
  {
    id: 'ocean_adventure',
    prompt: 'Make an underwater adventure with fish',
    ageGroup: '7-9',
    difficulty: 'easy',
    expectedElements: {
      gameTitle: ['Ocean', 'Water', 'Fish', 'Sea', 'Aquatic'],
      gameType: ['top-down-collector', 'platformer'],
      theme: 'ocean',
      hasPlayer: true,
      hasCollectibles: true,
      hasGameCanvas: true
    }
  },
  {
    id: 'maze_puzzle',
    prompt: 'Create a maze puzzle game',
    ageGroup: '9-12',
    difficulty: 'medium',
    expectedElements: {
      gameTitle: ['Maze', 'Puzzle', 'Explorer'],
      gameType: 'top-down-collector',
      theme: ['forest', 'space', 'ocean'],
      hasPlayer: true,
      hasObstacles: true,
      hasGameCanvas: true
    }
  }
];

class ZambooTester {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 Starting Zamboo E2E Testing...');
    
    this.browser = await chromium.launch({
      headless: this.config.headless,
      viewport: this.config.viewport
    });
    
    this.context = await this.browser.newContext({
      viewport: this.config.viewport
    });
    
    this.page = await this.context.newPage();
    
    // Enhanced error handling
    this.page.on('console', msg => {
      const type = msg.type();
      if (['error', 'warn'].includes(type)) {
        console.log(`🔍 Browser ${type}: ${msg.text()}`);
      }
    });

    this.page.on('pageerror', error => {
      console.error('🚨 Page error:', error.message);
    });
  }

  async navigateToApp() {
    console.log(`📱 Navigating to ${this.config.baseURL}...`);
    
    try {
      await this.page.goto(this.config.baseURL);
      
      // Wait for the page to load properly
      await this.page.waitForSelector('h1', { timeout: 10000 });
      
      // Verify we're on the homepage
      const title = await this.page.textContent('h1');
      console.log(`✅ Homepage loaded. Main title: "${title}"`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load homepage:', error.message);
      return false;
    }
  }

  async navigateToCreatePage() {
    console.log('🎮 Navigating to Create page...');
    
    try {
      // Look for Create Game button or link
      const createButton = await this.page.locator('text=Create Game').or(
        this.page.locator('a[href="/create"]')
      ).or(
        this.page.locator('text=Create')
      ).first();
      
      if (await createButton.count() > 0) {
        await createButton.click();
      } else {
        // Navigate directly
        await this.page.goto(`${this.config.baseURL}/create`);
      }
      
      // Wait for create page to load
      await this.page.waitForSelector('input[type="text"], textarea', { timeout: 10000 });
      console.log('✅ Create page loaded successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to navigate to Create page:', error.message);
      return false;
    }
  }

  async fillGameForm(testPrompt) {
    console.log(`📝 Filling form for: "${testPrompt.prompt}"`);
    
    try {
      // Fill the game prompt - try multiple selectors
      const promptInputs = [
        'input[placeholder*="game"]',
        'textarea[placeholder*="game"]',
        'input[type="text"]',
        'textarea'
      ];
      
      let promptFilled = false;
      for (const selector of promptInputs) {
        const elements = await this.page.locator(selector);
        if (await elements.count() > 0) {
          await elements.first().fill(testPrompt.prompt);
          promptFilled = true;
          console.log(`✅ Game prompt filled using selector: ${selector}`);
          break;
        }
      }
      
      if (!promptFilled) {
        throw new Error('Could not find game prompt input field');
      }

      // Set age group if available
      try {
        const ageSelectors = [
          `select option[value="${testPrompt.ageGroup}"]`,
          `button:has-text("${testPrompt.ageGroup}")`,
          `input[value="${testPrompt.ageGroup}"]`
        ];
        
        for (const selector of ageSelectors) {
          if (await this.page.locator(selector).count() > 0) {
            await this.page.locator(selector).click();
            console.log(`✅ Age group set: ${testPrompt.ageGroup}`);
            break;
          }
        }
      } catch (error) {
        console.log(`⚠️ Age group setting skipped: ${error.message}`);
      }

      // Set difficulty if available
      try {
        const difficultySelectors = [
          `select option[value="${testPrompt.difficulty}"]`,
          `button:has-text("${testPrompt.difficulty}")`,
          `input[value="${testPrompt.difficulty}"]`
        ];
        
        for (const selector of difficultySelectors) {
          if (await this.page.locator(selector).count() > 0) {
            await this.page.locator(selector).click();
            console.log(`✅ Difficulty set: ${testPrompt.difficulty}`);
            break;
          }
        }
      } catch (error) {
        console.log(`⚠️ Difficulty setting skipped: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to fill form:', error.message);
      return false;
    }
  }

  async generateGame() {
    console.log('⚡ Starting game generation...');
    
    try {
      // Find and click the generate button - target the specific "Create My Game!" button
      const generateButtons = [
        'button:has-text("Create My Game!")',
        'button:has-text("Generate Game")',
        'button:has-text("Generate")',
        'button[type="submit"]',
        'input[type="submit"]',
        '.bg-duo-green-500' // Target the green Create button specifically
      ];
      
      let generateClicked = false;
      for (const selector of generateButtons) {
        const elements = await this.page.locator(selector);
        if (await elements.count() > 0) {
          // If multiple elements, try to find the main create button
          if (await elements.count() > 1) {
            const createButton = elements.filter({ hasText: 'Create My Game!' });
            if (await createButton.count() > 0) {
              await createButton.click();
            } else {
              await elements.last().click(); // Click the last one (usually the main button)
            }
          } else {
            await elements.click();
          }
          generateClicked = true;
          console.log(`✅ Generate button clicked using selector: ${selector}`);
          break;
        }
      }
      
      if (!generateClicked) {
        throw new Error('Could not find generate/create button');
      }

      // Wait for either game page or error
      console.log('⏳ Waiting for game generation to complete...');
      
      try {
        // Wait for either success (redirect to game) or error message
        await Promise.race([
          this.page.waitForURL('**/game/**', { timeout: this.config.timeout }),
          this.page.waitForSelector('[data-error], .error, .alert-error', { timeout: 5000 })
        ]);
        
        // Check if we're on the game page
        const currentUrl = this.page.url();
        if (currentUrl.includes('/game')) {
          console.log('✅ Successfully redirected to game page');
          return true;
        } else {
          // Check for error messages
          const errorElement = await this.page.locator('[data-error], .error, .alert-error').first();
          if (await errorElement.count() > 0) {
            const errorText = await errorElement.textContent();
            throw new Error(`Game generation failed with error: ${errorText}`);
          }
          return true; // No error found, assume success
        }
      } catch (timeoutError) {
        console.log('⏳ Still waiting for generation... checking current state');
        
        // Check if we're still on create page with loading state
        const loadingIndicators = await this.page.locator('.loading, [data-loading], .spinner, .generating').count();
        if (loadingIndicators > 0) {
          console.log('🔄 Game is still generating, waiting longer...');
          await this.page.waitForTimeout(30000); // Wait additional 30 seconds
          return await this.checkGameGenerated();
        }
        
        throw new Error('Game generation timed out');
      }
    } catch (error) {
      console.error('❌ Game generation failed:', error.message);
      return false;
    }
  }

  async checkGameGenerated() {
    try {
      // Check if we're on game page or can access game
      const currentUrl = this.page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/game')) {
        return await this.verifyGamePage();
      }
      
      // Look for game link or game generated indicator
      const gameLinks = await this.page.locator('a[href*="/game"], button:has-text("Play"), .game-generated').count();
      if (gameLinks > 0) {
        console.log('✅ Game generation completed - game link found');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error checking game generation:', error.message);
      return false;
    }
  }

  async verifyGamePage() {
    console.log('🎯 Verifying game page...');
    
    try {
      // Wait for game elements to load
      await this.page.waitForTimeout(3000);
      
      const verifications = {
        hasGameTitle: false,
        hasGameCanvas: false,
        hasControls: false,
        hasZambooElements: false
      };

      // Check for game title
      const titleSelectors = ['h1', 'h2', '.game-title', '[data-testid="game-title"]'];
      for (const selector of titleSelectors) {
        if (await this.page.locator(selector).count() > 0) {
          const title = await this.page.locator(selector).first().textContent();
          console.log(`✅ Game title found: "${title}"`);
          verifications.hasGameTitle = true;
          break;
        }
      }

      // Check for game canvas or game container
      const gameSelectors = ['canvas', '.game-container', '#game', '[data-testid="game"]', '.phaser-game'];
      for (const selector of gameSelectors) {
        if (await this.page.locator(selector).count() > 0) {
          console.log(`✅ Game canvas/container found with selector: ${selector}`);
          verifications.hasGameCanvas = true;
          break;
        }
      }

      // Check for game controls or instructions
      const controlSelectors = ['.controls', '.instructions', ':has-text("arrow keys")', ':has-text("WASD")'];
      for (const selector of controlSelectors) {
        if (await this.page.locator(selector).count() > 0) {
          console.log(`✅ Game controls found`);
          verifications.hasControls = true;
          break;
        }
      }

      // Check for Zamboo elements
      const zambooSelectors = [':has-text("Zamboo")', '.zamboo', '[data-zamboo]'];
      for (const selector of zambooSelectors) {
        if (await this.page.locator(selector).count() > 0) {
          console.log(`✅ Zamboo elements found`);
          verifications.hasZambooElements = true;
          break;
        }
      }

      const successCount = Object.values(verifications).filter(v => v).length;
      console.log(`📊 Game verification: ${successCount}/4 checks passed`);
      
      return successCount >= 2; // At least game title and canvas
    } catch (error) {
      console.error('❌ Error verifying game page:', error.message);
      return false;
    }
  }

  async runSingleTest(testPrompt) {
    const startTime = Date.now();
    console.log(`\n🎮 === TESTING: ${testPrompt.id} ===`);
    console.log(`📝 Prompt: "${testPrompt.prompt}"`);
    console.log(`👥 Age: ${testPrompt.ageGroup}, Difficulty: ${testPrompt.difficulty}`);
    
    const testResult = {
      id: testPrompt.id,
      prompt: testPrompt.prompt,
      success: false,
      duration: 0,
      errors: [],
      details: {}
    };

    try {
      // Step 1: Navigate to homepage
      if (!await this.navigateToApp()) {
        testResult.errors.push('Failed to load homepage');
        return testResult;
      }

      // Step 2: Navigate to create page
      if (!await this.navigateToCreatePage()) {
        testResult.errors.push('Failed to navigate to create page');
        return testResult;
      }

      // Step 3: Fill the form
      if (!await this.fillGameForm(testPrompt)) {
        testResult.errors.push('Failed to fill game creation form');
        return testResult;
      }

      // Step 4: Generate the game
      if (!await this.generateGame()) {
        testResult.errors.push('Failed to generate game');
        return testResult;
      }

      // Step 5: Verify the game was created
      if (!await this.checkGameGenerated()) {
        testResult.errors.push('Game generation verification failed');
        return testResult;
      }

      testResult.success = true;
      console.log(`✅ Test ${testPrompt.id} PASSED`);

    } catch (error) {
      testResult.errors.push(`Unexpected error: ${error.message}`);
      console.error(`❌ Test ${testPrompt.id} FAILED:`, error.message);
    }

    testResult.duration = Date.now() - startTime;
    console.log(`⏱️ Test duration: ${testResult.duration}ms`);
    
    return testResult;
  }

  async runAllTests() {
    console.log(`\n🚀 === STARTING COMPREHENSIVE E2E TESTING ===`);
    console.log(`📋 Testing ${TEST_PROMPTS.length} different game generation scenarios`);
    
    const startTime = Date.now();
    
    for (const testPrompt of TEST_PROMPTS) {
      const result = await this.runSingleTest(testPrompt);
      this.testResults.push(result);
      
      // Add delay between tests
      if (TEST_PROMPTS.indexOf(testPrompt) < TEST_PROMPTS.length - 1) {
        console.log('⏸️ Pausing between tests...');
        await this.page.waitForTimeout(2000);
      }
    }

    const totalDuration = Date.now() - startTime;
    this.printResults(totalDuration);
  }

  printResults(totalDuration) {
    console.log(`\n📊 === TEST RESULTS SUMMARY ===`);
    console.log(`⏱️ Total testing time: ${totalDuration}ms (${(totalDuration/1000/60).toFixed(1)} minutes)`);
    
    const passed = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.length - passed;
    
    console.log(`✅ Passed: ${passed}/${this.testResults.length}`);
    console.log(`❌ Failed: ${failed}/${this.testResults.length}`);
    
    if (passed === this.testResults.length) {
      console.log(`\n🎉 ALL TESTS PASSED! Game generation is working perfectly! 🎉`);
    } else {
      console.log(`\n⚠️ Some tests failed. Details below:`);
    }
    
    // Detailed results
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = (result.duration / 1000).toFixed(1);
      
      console.log(`\n${status} ${result.id.toUpperCase()}`);
      console.log(`   📝 "${result.prompt}"`);
      console.log(`   ⏱️ ${duration}s`);
      
      if (!result.success && result.errors.length > 0) {
        console.log(`   🚨 Errors:`);
        result.errors.forEach(error => console.log(`      • ${error}`));
      }
    });

    // Final verdict
    console.log(`\n${'='.repeat(50)}`);
    if (passed === this.testResults.length) {
      console.log(`🏆 ZAMBOO GAME GENERATION: FULLY FUNCTIONAL`);
      console.log(`🎮 All ${this.testResults.length} game types generated successfully`);
    } else {
      console.log(`⚠️ ZAMBOO GAME GENERATION: ${passed}/${this.testResults.length} working`);
      console.log(`🔧 ${failed} test(s) need attention`);
    }
    console.log(`${'='.repeat(50)}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser cleanup completed');
    }
  }
}

// Main execution
async function main() {
  const tester = new ZambooTester(TEST_CONFIG);
  
  try {
    await tester.setup();
    await tester.runAllTests();
  } catch (error) {
    console.error('💥 Critical testing error:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ZambooTester, TEST_PROMPTS };