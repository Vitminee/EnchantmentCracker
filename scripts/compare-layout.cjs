const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  fs.mkdirSync('screenshots', { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  const win = await page.$('#minecraft-window');
  const box = await win.boundingBox();

  // Tab 0
  await page.mouse.move(0, 0);
  await page.waitForTimeout(200);
  await page.screenshot({
    path: 'screenshots/tab0_web.png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });

  // Tab 1
  await page.mouse.click(box.x + 80, box.y + 30);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: 'screenshots/tab1_web.png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });

  // Tab 2
  await page.mouse.click(box.x + 135, box.y + 30);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: 'screenshots/tab2_web.png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });

  await browser.close();
  console.log('Saved screenshots/tab0_web.png, tab1_web.png, tab2_web.png');
})();
