const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  fs.mkdirSync('screenshots', { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  const inputs = await page.$$('#tab-seed-cracker input.mc-input');
  // inputs: xpSeed1 (0), xpSeed2 (1), playerSeed (2), bookshelves (3), slot1 (4), slot2 (5), slot3 (6)

  const win = await page.$('#minecraft-window');
  const box = await win.boundingBox();

  async function enterAndCheck(b, s1, s2, s3, stepName) {
    console.log(`\n--- ${stepName}: b=${b}, s1=${s1}, s2=${s2}, s3=${s3} ---`);
    await inputs[3].fill(String(b));
    await inputs[4].fill(String(s1));
    await inputs[5].fill(String(s2));
    await inputs[6].fill(String(s3));

    // Click Check button
    await page.mouse.click(box.x + 8 + 100, box.y + 78 + 282 + 10);
    // Move mouse away so tooltip doesn't obscure the button text
    await page.mouse.move(0, 0);

    // Wait for crack to complete
    let lastText = '';
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(500);
      lastText = await page.evaluate(() => {
        const s = document.querySelectorAll('#tab-seed-cracker .mc-button-text');
        return s[1]?.textContent;
      });
      if (lastText && !lastText.startsWith('Progress')) {
        break;
      }
    }
    console.log(`${stepName} Result: ${lastText}`);

    const xp1 = await inputs[0].inputValue();
    console.log(`XP Seed 1 Field: "${xp1}"`);

    await page.screenshot({
      path: `screenshots/${stepName.toLowerCase().replace(/ /g, '_')}.png`,
      clip: { x: box.x, y: box.y, width: box.width, height: box.height }
    });

    return lastText;
  }

  // Step 1: b=15, s1=4, s2=15, s3=30
  await enterAndCheck(15, 4, 15, 30, 'Step 1 First Input');

  // Step 2: b=10, s1=5, s2=13, s3=20
  await enterAndCheck(10, 5, 13, 20, 'Step 2 Second Input');

  // Step 3: b=5, s1=1, s2=7, s3=12
  await enterAndCheck(5, 1, 7, 12, 'Step 3 Third Input');

  // Step 4: b=0, s1=1, s2=5, s3=5
  await enterAndCheck(0, 1, 5, 5, 'Step 4 Fourth Input');

  await browser.close();
  console.log('\nAll 4 steps completed successfully!');
})();
