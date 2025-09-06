const { chromium } = require('playwright');

async function quickAlignmentCheck() {
  console.log('🔍 QUICK ALIGNMENT CHECK');
  console.log('========================');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Go directly to game page to check existing game data
    console.log('🎮 Checking current game data...');
    await page.goto('http://localhost:3000/game');
    await page.waitForTimeout(3000);

    // Extract current game data
    const gameData = await page.evaluate(() => {
      const currentGame = window.localStorage.getItem('currentGame');
      if (currentGame) {
        const game = JSON.parse(currentGame);
        return {
          title: game.title,
          description: game.description,
          userVision: game.userVision,
          createdBy: game.createdBy,
          conceptFirst: game.conceptFirst,
          experienceAnalysis: game.experienceAnalysis?.substring(0, 1000),
          gameImplementation: game.gameImplementation?.substring(0, 1000),
          fullData: game
        };
      }
      return null;
    });

    if (gameData) {
      console.log('\n📊 CURRENT GAME ANALYSIS:');
      console.log('🎯 Title:', gameData.title);
      console.log('📝 Description:', gameData.description);
      console.log('👁️ User Vision:', gameData.userVision);
      console.log('🤖 Created by:', gameData.createdBy);
      console.log('🚀 Concept First:', gameData.conceptFirst);
      
      console.log('\n🧠 Experience Analysis Preview:');
      console.log(gameData.experienceAnalysis);
      console.log('\n⚙️ Game Implementation Preview:');
      console.log(gameData.gameImplementation);
      
      // Analyze alignment
      const userPrompt = gameData.userVision || "Unknown";
      const allContent = (gameData.experienceAnalysis + ' ' + 
                         gameData.gameImplementation + ' ' + 
                         gameData.title + ' ' + 
                         gameData.description).toLowerCase();
      
      console.log('\n🎯 ALIGNMENT ANALYSIS:');
      console.log('User Prompt:', userPrompt);
      
      // Check for key themes based on common prompts
      const themes = {
        'cyberpunk': allContent.includes('cyberpunk') || allContent.includes('cyber') || allContent.includes('neon'),
        'racing': allContent.includes('racing') || allContent.includes('race') || allContent.includes('speed'),
        'highway': allContent.includes('highway') || allContent.includes('road') || allContent.includes('track'),
        'futuristic': allContent.includes('futuristic') || allContent.includes('future') || allContent.includes('tech'),
        'underwater': allContent.includes('underwater') || allContent.includes('ocean') || allContent.includes('sea'),
        'magical': allContent.includes('magical') || allContent.includes('magic') || allContent.includes('mystical'),
        'forest': allContent.includes('forest') || allContent.includes('trees') || allContent.includes('nature')
      };
      
      Object.entries(themes).forEach(([theme, found]) => {
        console.log(`  ${found ? '✅' : '❌'} ${theme.toUpperCase()}: ${found ? 'DETECTED' : 'NOT FOUND'}`);
      });
      
      // Save full data for analysis
      require('fs').writeFileSync('current-game-analysis.json', JSON.stringify(gameData, null, 2));
      console.log('\n💾 Full game data saved to current-game-analysis.json');
      
    } else {
      console.log('❌ No game data found in localStorage');
    }

    // Check if we can navigate to create page and see the UI
    await page.goto('http://localhost:3000/create');
    await page.waitForTimeout(2000);
    
    const createPageInfo = await page.evaluate(() => {
      return {
        hasRevolutionaryMode: document.body.textContent.includes('Revolutionary'),
        hasConceptFirst: document.body.textContent.includes('Concept-First'),
        hasTraditionalMode: document.body.textContent.includes('Traditional Mode') && 
                           document.body.textContent.includes('Age Group'),
        examples: Array.from(document.querySelectorAll('button'))
                       .filter(btn => btn.textContent.includes('💡'))
                       .map(btn => btn.textContent.replace('💡 ', ''))
      };
    });
    
    console.log('\n🎨 CREATE PAGE ANALYSIS:');
    console.log('Has Revolutionary Mode:', createPageInfo.hasRevolutionaryMode ? '✅' : '❌');
    console.log('Has Concept-First:', createPageInfo.hasConceptFirst ? '✅' : '❌');
    console.log('Still has Traditional Mode:', createPageInfo.hasTraditionalMode ? '❌' : '✅');
    console.log('Revolutionary Examples:', createPageInfo.examples.length);
    
    await page.screenshot({ path: 'create-page-check.png' });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n✅ Quick alignment check completed');
    await browser.close();
  }
}

quickAlignmentCheck();