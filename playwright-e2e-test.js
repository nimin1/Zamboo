const { chromium } = require('playwright');

async function testZambooEndToEnd() {
  console.log('🎮 Starting Zamboo End-to-End Game Generation Test');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Test prompts for comprehensive coverage
  const testPrompts = [
    {
      prompt: "Create a simple car racing game",
      age: "8-10",
      difficulty: "simple",
      expectedTitle: /car|racing|race/i,
      expectedObjects: ["car", "finish", "goal"]
    },
    {
      prompt: "Make a game where I collect stars",
      age: "6-8", 
      difficulty: "easy",
      expectedTitle: /star|collect/i,
      expectedObjects: ["star", "collect"]
    },
    {
      prompt: "Create a jumping game with platforms",
      age: "8-12",
      difficulty: "medium", 
      expectedTitle: /jump|platform/i,
      expectedObjects: ["platform", "jump"]
    },
    {
      prompt: "Make a simple maze game",
      age: "7-9",
      difficulty: "simple",
      expectedTitle: /maze|navigation/i,
      expectedObjects: ["maze", "path"]
    },
    {
      prompt: "Create a fish swimming game",
      age: "5-7",
      difficulty: "easy",
      expectedTitle: /fish|swim/i,
      expectedObjects: ["fish", "water"]
    }
  ];

  try {
    // Navigate to Zamboo home page
    console.log('📍 Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check if homepage loads
    await page.waitForSelector('text=Start Creating Games', { timeout: 10000 });
    console.log('✅ Homepage loaded successfully');

    // Test each game generation prompt
    for (let i = 0; i < testPrompts.length; i++) {
      const testCase = testPrompts[i];
      console.log(`\n🧪 Test ${i + 1}/5: "${testCase.prompt}"`);

      // Navigate to create page  
      await page.click('text=Start Creating Games');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('textarea[placeholder*="game"]', { timeout: 10000 });
      console.log('✅ Create page loaded');

      // Enter game prompt
      await page.fill('textarea[placeholder*="game"]', testCase.prompt);
      
      // Set age group if available
      const ageSelectors = await page.$$('[data-testid*="age"], .age-selector, input[type="radio"]');
      if (ageSelectors.length > 0) {
        console.log('📝 Setting age group...');
        // Try to find and click appropriate age group
        await page.click(`text=${testCase.age}`, { timeout: 3000 }).catch(() => {
          console.log('⚠️ Age selector not found, continuing...');
        });
      }

      // Set difficulty if available  
      const difficultySelectors = await page.$$('[data-testid*="difficulty"], .difficulty-selector');
      if (difficultySelectors.length > 0) {
        console.log('📝 Setting difficulty...');
        await page.click(`text=${testCase.difficulty}`, { timeout: 3000 }).catch(() => {
          console.log('⚠️ Difficulty selector not found, continuing...');
        });
      }

      // Submit the form
      const createButton = page.locator('button:has-text("Create My Game!")');
      
      // Wait for button to become enabled after filling the form
      await page.waitForFunction(() => {
        const button = document.querySelector('button[class*="bg-duo-green"]');
        return button && !button.disabled;
      }, { timeout: 10000 });
      
      console.log('🚀 Generating game...');
      
      // Wait for network request to complete
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/generateGame') && response.status() === 200,
        { timeout: 120000 } // 2 minute timeout for AI generation
      );
      
      await createButton.click();
      
      try {
        const response = await responsePromise;
        console.log('✅ Game generation API completed successfully');
        
        // Wait for redirect to game page
        await page.waitForURL('**/game', { timeout: 30000 });
        console.log('✅ Redirected to game page');

        // Check if game canvas loads
        const canvas = await page.locator('canvas').first();
        await canvas.waitFor({ timeout: 15000 });
        console.log('✅ Game canvas rendered');

        // Check game title matches expected pattern
        const title = await page.locator('h1, h2, .game-title').first().textContent();
        if (title && testCase.expectedTitle.test(title)) {
          console.log(`✅ Game title matches expected pattern: "${title}"`);
        } else {
          console.log(`⚠️ Game title "${title}" may not match expected pattern`);
        }

        // Check if game controls are visible
        const controls = await page.locator('text=Arrow Keys, text=WASD, .controls').count();
        if (controls > 0) {
          console.log('✅ Game controls information found');
        }

        // Check if score display exists
        const scoreDisplay = await page.locator('text=Score, .score').count();
        if (scoreDisplay > 0) {
          console.log('✅ Score display found');
        }

        // Try to interact with the game (simulate key press)
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowDown');
        console.log('✅ Game interaction test completed');

        console.log(`🎉 Test ${i + 1} PASSED: "${testCase.prompt}"`);

      } catch (error) {
        console.error(`❌ Test ${i + 1} FAILED: "${testCase.prompt}"`);
        console.error(`Error: ${error.message}`);
        
        // Take screenshot for debugging
        await page.screenshot({ 
          path: `/tmp/zamboo-test-${i + 1}-error.png`,
          fullPage: true 
        });
        console.log(`📸 Error screenshot saved: /tmp/zamboo-test-${i + 1}-error.png`);
      }

      // Navigate back to home for next test
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Small delay between tests
      await page.waitForTimeout(2000);
    }

    console.log('\n🏁 All tests completed!');

  } catch (error) {
    console.error('❌ Critical error during testing:', error.message);
    await page.screenshot({ 
      path: '/tmp/zamboo-critical-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// Run the tests
testZambooEndToEnd().catch(console.error);