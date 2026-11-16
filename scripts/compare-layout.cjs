const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Hide scale-controls to avoid it appearing in screenshots
  await page.evaluate(() => {
    const controls = document.getElementById('scale-controls');
    if (controls) controls.style.display = 'none';
  });

  const win = await page.$('#minecraft-window');
  const box = await win.boundingBox();

  // Tab 0
  await page.screenshot({
    path: 'C:/Users/vit/AppData/Local/Temp/opencode/crop_tab0.png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });

  // Tab 1
  await page.mouse.click(box.x + 160, box.y + 60);
  await page.mouse.move(0, 0); // move mouse away to hide tooltips
  await page.waitForTimeout(300);
  await page.screenshot({
    path: 'C:/Users/vit/AppData/Local/Temp/opencode/crop_tab1.png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });

  // Tab 2
  await page.mouse.click(box.x + 270, box.y + 60);
  await page.mouse.move(0, 0); // move mouse away to hide tooltips
  await page.waitForTimeout(300);
  await page.screenshot({
    path: 'C:/Users/vit/AppData/Local/Temp/opencode/crop_tab2.png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });

  await browser.close();
  console.log('Screenshots saved to temp folder.');
})();
