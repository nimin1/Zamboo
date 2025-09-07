// Single game test to debug the issue
const { chromium } = require('playwright');

async function testSingleGame() {
  console.log('🚀 Testing single game generation...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    viewport: { width: 1280, height: 720 }
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  // Add logging
  page.on('console', msg => {
    console.log(`🔍 Browser: ${msg.text()}`);
  });

  try {
    // Step 1: Navigate to homepage
    console.log('📱 Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1', { timeout: 10000 });
    console.log('✅ Homepage loaded');

    // Step 2: Navigate to create page
    console.log('🎮 Navigating to Create page...');
    const createButton = await page.locator('text=Create Game').or(
      page.locator('a[href="/create"]')
    ).first();
    
    if (await createButton.count() > 0) {
      await createButton.click();
    } else {
      await page.goto('http://localhost:3000/create');
    }
    
    await page.waitForSelector('textarea, input[type="text"]', { timeout: 10000 });
    console.log('✅ Create page loaded');

    // Step 3: Fill the form
    console.log('📝 Filling form...');
    const gamePrompt = 'Create a car racing game';
    
    // Find the textarea
    const textarea = page.locator('textarea').first();
    await textarea.fill(gamePrompt);
    console.log('✅ Game prompt filled');

    // Debug: Take a screenshot to see the page state
    await page.screenshot({ path: 'debug-before-click.png' });
    console.log('📸 Screenshot saved as debug-before-click.png');

    // Step 4: Find all buttons and log them
    console.log('🔍 Finding all buttons on the page...');
    const allButtons = await page.locator('button').all();
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      const buttonClass = await allButtons[i].getAttribute('class');
      console.log(`Button ${i}: "${buttonText}" (class: ${buttonClass})`);
    }

    // Step 5: Click the Create My Game button specifically
    console.log('⚡ Looking for Create My Game button...');
    const createGameButton = page.locator('button', { hasText: 'Create My Game!' });
    
    if (await createGameButton.count() > 0) {
      console.log('✅ Found Create My Game button');
      await createGameButton.click();
      console.log('✅ Clicked Create My Game button');
      
      // Wait for some response (either redirect or loading state)
      console.log('⏳ Waiting for response...');
      
      try {
        // Wait for either URL change or some loading indicator
        await Promise.race([
          page.waitForURL('**/game/**', { timeout: 30000 }),
          page.waitForSelector('.loading, .generating, .spinner', { timeout: 5000 })
        ]);
        
        const currentUrl = page.url();
        console.log(`📍 Current URL after click: ${currentUrl}`);
        
        if (currentUrl.includes('/game')) {
          console.log('🎉 SUCCESS: Redirected to game page!');
          
          // Take final screenshot
          await page.screenshot({ path: 'debug-game-page.png' });
          console.log('📸 Game page screenshot saved');
          
        } else {
          console.log('⏳ Still on create page, checking for loading state...');
          await page.waitForTimeout(10000); // Wait 10 more seconds
          
          const finalUrl = page.url();
          console.log(`📍 Final URL: ${finalUrl}`);
          
          if (finalUrl.includes('/game')) {
            console.log('🎉 SUCCESS: Game generated and redirected!');
          } else {
            console.log('❌ Game generation may have failed or is still processing');
          }
        }
        
      } catch (waitError) {
        console.log('⚠️ Timeout waiting for response. Taking screenshot...');
        await page.screenshot({ path: 'debug-after-timeout.png' });
        
        // Check current state
        const currentUrl = page.url();
        console.log(`📍 URL after timeout: ${currentUrl}`);
        
        // Look for any error messages
        const errorElements = await page.locator('.error, .alert, [data-error]').all();
        for (const error of errorElements) {
          const errorText = await error.textContent();
          console.log(`🚨 Error found: ${errorText}`);
        }
      }
      
    } else {
      console.log('❌ Create My Game button not found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'debug-error.png' });
    console.log('📸 Error screenshot saved');
  } finally {
    console.log('🧹 Cleaning up...');
    await browser.close();
  }
}

testSingleGame().catch(console.error);