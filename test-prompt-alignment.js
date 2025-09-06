const { chromium } = require('playwright');

async function testPromptAlignment() {
  console.log('🎯 TESTING PROMPT-TO-GAME ALIGNMENT');
  console.log('===================================');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages and API calls
  page.on('console', msg => console.log(`🖥️ Console ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.log(`❌ Page Error: ${error.message}`));
  
  // Monitor network requests to see API calls
  const apiResponses = [];
  page.on('response', async response => {
    if (response.url().includes('/api/conceptFirst')) {
      try {
        const data = await response.json();
        apiResponses.push({
          status: response.status(),
          data: data
        });
        console.log('📡 ConceptFirst API Response Status:', response.status());
      } catch (e) {
        console.log('📡 ConceptFirst API Response (non-JSON):', response.status());
      }
    }
  });

  try {
    // Test different prompts for alignment
    const testPrompts = [
      {
        prompt: "cyberpunk racing through neon highways",
        expectedThemes: ["cyberpunk", "neon", "racing", "highway", "futuristic", "speed"],
        expectedVisuals: ["neon colors", "glow effects", "cyberpunk aesthetic", "racing mechanics"]
      },
      {
        prompt: "underwater meditation with bioluminescent creatures",
        expectedThemes: ["underwater", "meditation", "bioluminescent", "peaceful", "ocean", "calm"],
        expectedVisuals: ["blue tones", "glow effects", "underwater setting", "peaceful interaction"]
      },
      {
        prompt: "magical forest with dancing mushrooms",
        expectedThemes: ["magical", "forest", "mushrooms", "dancing", "nature", "whimsical"],
        expectedVisuals: ["forest colors", "magical effects", "animated elements", "nature theme"]
      }
    ];

    for (let i = 0; i < testPrompts.length; i++) {
      const testCase = testPrompts[i];
      console.log(`\n🚀 TEST ${i + 1}: "${testCase.prompt}"`);
      console.log('Expected themes:', testCase.expectedThemes.join(', '));
      
      // Navigate to create page
      await page.goto('http://localhost:3000/create');
      await page.waitForTimeout(2000);

      // Clear any previous content
      const promptTextarea = await page.locator('textarea').first();
      await promptTextarea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Delete');
      
      // Enter the test prompt
      console.log('📝 Entering prompt...');
      await promptTextarea.fill(testCase.prompt);
      
      // Start generation
      console.log('🎮 Starting game generation...');
      const createButton = await page.locator('text=Create My Game!');
      await createButton.click();

      // Wait for generation to complete (redirect to /game or error)
      console.log('⏳ Waiting for generation to complete...');
      await page.waitForFunction(() => {
        return window.location.href.includes('/game') || 
               document.querySelector('[class*="error"]') !== null;
      }, { timeout: 300000 }); // 5 minutes for AI generation

      const currentUrl = page.url();
      
      if (currentUrl.includes('/game')) {
        console.log('✅ Game generation completed successfully');
        
        // Wait for game to load
        await page.waitForTimeout(5000);
        
        // Extract game data and analyze alignment
        const gameAnalysis = await page.evaluate(() => {
          const currentGame = window.localStorage.getItem('currentGame');
          if (currentGame) {
            const game = JSON.parse(currentGame);
            return {
              title: game.title,
              description: game.description,
              experienceAnalysis: game.experienceAnalysis,
              gameImplementation: game.gameImplementation,
              userVision: game.userVision,
              createdBy: game.createdBy,
              fullGameData: JSON.stringify(game, null, 2)
            };
          }
          return null;
        });

        if (gameAnalysis) {
          console.log('\n📊 GAME ANALYSIS RESULTS:');
          console.log('🎯 Title:', gameAnalysis.title);
          console.log('📝 Description:', gameAnalysis.description);
          console.log('👤 Created by:', gameAnalysis.createdBy);
          console.log('🔍 User Vision captured:', gameAnalysis.userVision);
          
          // Check alignment with expected themes
          console.log('\n🎨 THEME ALIGNMENT CHECK:');
          const fullText = (gameAnalysis.experienceAnalysis + ' ' + 
                           gameAnalysis.gameImplementation + ' ' + 
                           gameAnalysis.title + ' ' + 
                           gameAnalysis.description).toLowerCase();
          
          const alignmentScore = testCase.expectedThemes.reduce((score, theme) => {
            const found = fullText.includes(theme.toLowerCase());
            console.log(`  ${found ? '✅' : '❌'} ${theme}: ${found ? 'FOUND' : 'NOT FOUND'}`);
            return score + (found ? 1 : 0);
          }, 0);
          
          const alignmentPercentage = (alignmentScore / testCase.expectedThemes.length) * 100;
          console.log(`\n🎯 ALIGNMENT SCORE: ${alignmentScore}/${testCase.expectedThemes.length} (${alignmentPercentage.toFixed(1)}%)`);
          
          // Detailed AI response analysis
          console.log('\n🧠 AI EXPERIENCE ANALYSIS:');
          console.log(gameAnalysis.experienceAnalysis?.substring(0, 500) + '...');
          
          console.log('\n⚙️ AI IMPLEMENTATION DESIGN:');
          console.log(gameAnalysis.gameImplementation?.substring(0, 500) + '...');
          
          // Check if game is actually playable
          const canvas = await page.locator('canvas').count();
          console.log(`\n🎮 GAME RENDERING: ${canvas > 0 ? '✅ Canvas found' : '❌ No canvas'}`);
          
          if (canvas > 0) {
            // Try to interact with the game
            const startButton = await page.locator('text=Start Game').first();
            if (await startButton.isVisible()) {
              console.log('🎯 Clicking Start Game...');
              await startButton.click();
              await page.waitForTimeout(3000);
              
              // Check for game interaction
              const gameElements = await page.evaluate(() => {
                const canvas = document.querySelector('canvas');
                return {
                  canvasExists: !!canvas,
                  canvasSize: canvas ? `${canvas.width}x${canvas.height}` : null,
                  gameRunning: !!document.querySelector('[class*="game-running"]') || 
                              !!document.querySelector('[class*="playing"]') ||
                              document.body.textContent.includes('Score:')
                };
              });
              
              console.log('🎮 Game Status:', gameElements);
            }
          }
          
          // Save detailed analysis
          console.log('\n💾 Saving detailed analysis...');
          const detailedReport = {
            testPrompt: testCase.prompt,
            expectedThemes: testCase.expectedThemes,
            alignmentScore: alignmentScore,
            alignmentPercentage: alignmentPercentage,
            gameData: gameAnalysis,
            timestamp: new Date().toISOString()
          };
          
          require('fs').writeFileSync(
            `alignment-test-${i + 1}.json`, 
            JSON.stringify(detailedReport, null, 2)
          );
          
          // Take screenshot
          await page.screenshot({ 
            path: `game-alignment-test-${i + 1}.png`,
            fullPage: true 
          });
          
        } else {
          console.log('❌ Could not extract game data from localStorage');
        }
        
      } else {
        console.log('❌ Game generation failed or redirected elsewhere');
        await page.screenshot({ 
          path: `generation-error-${i + 1}.png` 
        });
      }
      
      console.log(`\n✅ Test ${i + 1} completed\n${'='.repeat(50)}`);
    }

    // Final API response analysis
    console.log('\n📡 API RESPONSE ANALYSIS:');
    apiResponses.forEach((response, index) => {
      console.log(`Response ${index + 1}:`, response.status);
      if (response.data) {
        console.log('- Success:', response.data.success);
        console.log('- Concept First:', response.data.conceptFirst);
        console.log('- Message:', response.data.message);
      }
    });

  } catch (error) {
    console.error('💥 Test error:', error.message);
    await page.screenshot({ path: 'alignment-test-error.png' });
  } finally {
    console.log('\n🔚 Prompt alignment testing completed');
    console.log('📁 Check the generated JSON files and screenshots for detailed results');
    // Keep browser open for manual inspection
    // await browser.close();
  }
}

testPromptAlignment();