// Improved test with better wait handling for game generation
const { chromium } = require('playwright');

async function testGameGeneration(gamePrompt = 'Create a space collecting game with stars') {
  console.log('🚀 Testing game generation with improved waits...');
  
  const browser = await chromium.launch({ 
    headless: false,
    viewport: { width: 1280, height: 720 }
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  // Enhanced logging
  page.on('console', msg => {
    const type = msg.type();
    console.log(`🔍 Browser ${type}: ${msg.text()}`);
  });

  page.on('response', response => {
    if (response.url().includes('/api/generateGame')) {
      console.log(`📡 API Response: ${response.status()} - ${response.url()}`);
    }
  });

  try {
    console.log('📱 Navigating to create page...');
    await page.goto('http://localhost:3000/create');
    await page.waitForSelector('textarea', { timeout: 10000 });
    console.log('✅ Create page loaded');

    console.log(`📝 Filling game prompt: "${gamePrompt}"...`);
    await page.fill('textarea', gamePrompt);
    console.log('✅ Game prompt filled');

    console.log('⚡ Clicking Create My Game button...');
    const createButton = page.locator('button', { hasText: 'Create My Game!' });
    await createButton.click();
    console.log('✅ Button clicked, waiting for generation...');

    // Wait for API request to complete (up to 60 seconds)
    console.log('⏳ Waiting for API request to complete...');
    
    const startTime = Date.now();
    let gameGenerated = false;
    let attempts = 0;
    const maxAttempts = 12; // 12 attempts * 5 seconds = 60 seconds max
    
    while (!gameGenerated && attempts < maxAttempts) {
      attempts++;
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`⏳ Attempt ${attempts}/${maxAttempts} (${elapsed}s elapsed)...`);
      
      await page.waitForTimeout(5000); // Wait 5 seconds between checks
      
      // Check URL for redirect to game
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/game')) {
        gameGenerated = true;
        console.log('🎉 SUCCESS: Redirected to game page!');
        break;
      }
      
      // Check for game-related elements that might appear
      const gameElements = [
        'canvas',
        '.game-container',
        '#game',
        '.phaser-game',
        ':has-text("Game generated")',
        ':has-text("Play your game")',
        'button:has-text("Play")'
      ];
      
      for (const selector of gameElements) {
        if (await page.locator(selector).count() > 0) {
          console.log(`✅ Found game element: ${selector}`);
          gameGenerated = true;
          break;
        }
      }
      
      if (gameGenerated) break;
      
      // Check for error messages
      const errorElements = await page.locator('.error, .alert, [data-error], :has-text("Error")').count();
      if (errorElements > 0) {
        const errorText = await page.locator('.error, .alert, [data-error], :has-text("Error")').first().textContent();
        console.log(`🚨 Error detected: ${errorText}`);
        break;
      }
      
      // Check if still on create page with loading indicators
      const loadingElements = await page.locator('.loading, .generating, .spinner, :has-text("Generating")').count();
      if (loadingElements > 0) {
        console.log('🔄 Still generating...');
      }
    }
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`⏱️ Total time: ${totalTime} seconds`);
    
    if (gameGenerated) {
      console.log('🎉 SUCCESS: Game generation completed!');
      
      // Take screenshot of success
      await page.screenshot({ path: 'success-game-generated.png' });
      console.log('📸 Success screenshot saved');
      
      // Check for game title and elements
      const gameTitle = await page.locator('h1, h2, .game-title').first().textContent().catch(() => 'Unknown');
      console.log(`🎮 Game title: "${gameTitle}"`);
      
      return { success: true, gameTitle, totalTime };
      
    } else {
      console.log('❌ TIMEOUT: Game generation did not complete within 60 seconds');
      
      // Take screenshot of timeout state
      await page.screenshot({ path: 'timeout-state.png' });
      console.log('📸 Timeout screenshot saved');
      
      // Log final page state
      const finalUrl = page.url();
      const pageTitle = await page.title();
      console.log(`📍 Final URL: ${finalUrl}`);
      console.log(`📄 Page title: ${pageTitle}`);
      
      return { success: false, error: 'Timeout after 60 seconds', totalTime };
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    await page.screenshot({ path: 'error-state.png' });
    return { success: false, error: error.message };
  } finally {
    await browser.close();
    console.log('🧹 Browser closed');
  }
}

// Run multiple tests
async function runMultipleTests() {
  const prompts = [
    'Create a space collecting game with stars',
    'Make a car racing game',
    'Create a jumping platform game',
    'Make an ocean adventure with fish',
    'Create a maze puzzle game'
  ];
  
  const results = [];
  
  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎮 TEST ${i + 1}/${prompts.length}: "${prompt}"`);
    console.log(`${'='.repeat(60)}`);
    
    const result = await testGameGeneration(prompt);
    results.push({ prompt, ...result });
    
    console.log(`📊 Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (i < prompts.length - 1) {
      console.log('⏸️ Pausing 3 seconds between tests...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // Final summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FINAL RESULTS SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${results.length - successful}/${results.length}`);
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const time = result.totalTime ? `(${result.totalTime}s)` : '';
    console.log(`${status} Test ${index + 1}: "${result.prompt}" ${time}`);
    if (!result.success && result.error) {
      console.log(`   🚨 ${result.error}`);
    }
    if (result.success && result.gameTitle) {
      console.log(`   🎮 Game: "${result.gameTitle}"`);
    }
  });
  
  if (successful === results.length) {
    console.log('\n🎉 ALL TESTS PASSED! Game generation is fully functional! 🎉');
  } else {
    console.log(`\n⚠️ ${results.length - successful} test(s) failed. Game generation needs debugging.`);
  }
}

// Run either single test or multiple tests
const args = process.argv.slice(2);
if (args.includes('--single')) {
  testGameGeneration().then(result => {
    console.log('\n📊 Single test result:', result);
  }).catch(console.error);
} else {
  runMultipleTests().catch(console.error);
}