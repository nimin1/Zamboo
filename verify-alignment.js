const { chromium } = require('playwright');

async function verifyAlignment() {
  console.log('🔍 VERIFYING PROMPT-TO-GAME ALIGNMENT');
  console.log('=====================================');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  // Monitor API responses
  let lastAPIResponse = null;
  page.on('response', async response => {
    if (response.url().includes('/api/conceptFirst')) {
      try {
        const data = await response.json();
        lastAPIResponse = data;
        console.log('📡 API Response received:', response.status());
      } catch (e) {
        console.log('📡 API Response (non-JSON):', response.status());
      }
    }
  });

  try {
    const testPrompt = "cyberpunk racing through neon highways";
    console.log('🎯 Testing prompt:', testPrompt);
    
    // Navigate to create page
    await page.goto('http://localhost:3000/create');
    await page.waitForTimeout(2000);

    // Clear and enter prompt
    const textarea = await page.locator('textarea').first();
    await textarea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(testPrompt);
    
    console.log('✅ Prompt entered');

    // Start generation
    const createButton = await page.locator('text=Create My Game!');
    await createButton.click();
    console.log('🚀 Generation started...');

    // Wait for either success (redirect to /game) or timeout
    try {
      await page.waitForURL('**/game', { timeout: 300000 }); // 5 minutes
      console.log('✅ Redirected to game page');
      
      // Wait a moment for the game to load
      await page.waitForTimeout(3000);
      
      // Extract game data
      const gameAnalysis = await page.evaluate(() => {
        const gameData = window.localStorage.getItem('currentGame');
        if (gameData) {
          const game = JSON.parse(gameData);
          return {
            title: game.title,
            description: game.description,
            userVision: game.userVision,
            conceptFirst: game.conceptFirst,
            experienceAnalysis: game.experienceAnalysis,
            gameImplementation: game.gameImplementation,
            createdBy: game.createdBy
          };
        }
        return null;
      });

      if (gameAnalysis) {
        console.log('\\n📊 GENERATED GAME ANALYSIS:');
        console.log('🎯 Title:', gameAnalysis.title);
        console.log('📝 Description:', gameAnalysis.description);
        console.log('👁️ User Vision:', gameAnalysis.userVision);
        console.log('🤖 Created by:', gameAnalysis.createdBy);
        console.log('🚀 Concept First:', gameAnalysis.conceptFirst);
        
        // Analyze content for theme alignment
        const allContent = (
          (gameAnalysis.experienceAnalysis || '') + ' ' +
          (gameAnalysis.gameImplementation || '') + ' ' +
          gameAnalysis.title + ' ' +
          gameAnalysis.description
        ).toLowerCase();
        
        console.log('\\n🎨 THEME ALIGNMENT ANALYSIS:');
        console.log('Original prompt:', testPrompt);
        
        const expectedThemes = ['cyberpunk', 'neon', 'racing', 'highway', 'futuristic', 'speed'];
        let alignedThemes = 0;
        
        expectedThemes.forEach(theme => {
          const variations = {
            'cyberpunk': ['cyberpunk', 'cyber'],
            'neon': ['neon', 'bright', 'glowing'],
            'racing': ['racing', 'race', 'speed', 'fast'],
            'highway': ['highway', 'road', 'street', 'track'],
            'futuristic': ['futuristic', 'future', 'sci-fi', 'tech'],
            'speed': ['speed', 'fast', 'velocity', 'acceleration']
          };
          
          const found = variations[theme]?.some(variant => allContent.includes(variant)) || allContent.includes(theme);
          console.log(`  ${found ? '✅' : '❌'} ${theme.toUpperCase()}: ${found ? 'FOUND' : 'NOT FOUND'}`);
          if (found) alignedThemes++;
        });
        
        const alignmentScore = (alignedThemes / expectedThemes.length) * 100;
        console.log(`\\n🎯 ALIGNMENT SCORE: ${alignedThemes}/${expectedThemes.length} (${alignmentScore.toFixed(1)}%)`);
        
        // Show sample content
        console.log('\\n📖 EXPERIENCE ANALYSIS SAMPLE:');
        console.log(gameAnalysis.experienceAnalysis?.substring(0, 500) + '...');
        
        console.log('\\n⚙️ IMPLEMENTATION SAMPLE:');
        console.log(gameAnalysis.gameImplementation?.substring(0, 500) + '...');
        
        // Save complete analysis
        const report = {
          prompt: testPrompt,
          gameData: gameAnalysis,
          alignmentScore: alignmentScore,
          alignedThemes: alignedThemes,
          totalThemes: expectedThemes.length,
          themeAnalysis: expectedThemes.map(theme => ({
            theme,
            found: (theme === 'cyberpunk' && (allContent.includes('cyberpunk') || allContent.includes('cyber'))) ||
                   (theme === 'neon' && (allContent.includes('neon') || allContent.includes('bright') || allContent.includes('glowing'))) ||
                   (theme === 'racing' && (allContent.includes('racing') || allContent.includes('race') || allContent.includes('speed'))) ||
                   (theme === 'highway' && (allContent.includes('highway') || allContent.includes('road') || allContent.includes('track'))) ||
                   (theme === 'futuristic' && (allContent.includes('futuristic') || allContent.includes('future') || allContent.includes('tech'))) ||
                   (theme === 'speed' && (allContent.includes('speed') || allContent.includes('fast') || allContent.includes('velocity'))) ||
                   allContent.includes(theme)
          })),
          timestamp: new Date().toISOString()
        };
        
        require('fs').writeFileSync('prompt-alignment-report.json', JSON.stringify(report, null, 2));
        console.log('\\n💾 Detailed report saved to prompt-alignment-report.json');
        
        if (alignmentScore >= 70) {
          console.log('\\n🎉 ALIGNMENT SUCCESS: Game content matches user prompt well!');
        } else if (alignmentScore >= 40) {
          console.log('\\n⚠️ PARTIAL ALIGNMENT: Some themes captured but could be improved');
        } else {
          console.log('\\n❌ POOR ALIGNMENT: Game content does not match user prompt');
        }
        
      } else {
        console.log('❌ Could not extract game data');
      }
      
      // Take screenshot of final game
      await page.screenshot({ path: 'generated-game-verification.png', fullPage: true });
      
    } catch (waitError) {
      console.log('⏰ Generation timed out or failed');
      
      // Check if there was an error message
      const errorElement = await page.locator('[class*="error"]').first();
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log('❌ Error message:', errorText);
      }
      
      await page.screenshot({ path: 'generation-timeout.png' });
    }

  } catch (error) {
    console.error('💥 Test error:', error.message);
    await page.screenshot({ path: 'verification-error.png' });
  } finally {
    console.log('\\n✅ Alignment verification completed');
    await browser.close();
  }
}

verifyAlignment();