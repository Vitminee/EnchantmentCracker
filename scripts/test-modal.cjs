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

  // 1. Enter numbers into Tab 0 to show centered numbers
  const inputs = await page.$$('#tab-seed-cracker input.mc-input');
  await inputs[0].fill("12345678");
  await inputs[1].fill("87654321");
  await inputs[3].fill("15");
  await inputs[4].fill("7");
  await inputs[5].fill("20");
  await inputs[6].fill("30");

  await page.screenshot({
    path: 'screenshots/tab0_centered_numbers.png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });

  // 2. Clear inputs, switch to Tab 1, click Calculate (without player seed) to open modal
  await inputs[2].fill(""); // ensure player seed is empty
  await page.mouse.click(box.x + 80, box.y + 30); // switch to Tab 1
  await page.waitForTimeout(300);

  // Click Calculate button: x=6..270, y=190..214 in content (y = 78 + 190 = 268)
  await page.mouse.click(box.x + 100, box.y + 278);
  await page.waitForTimeout(300);

  // Screenshot modal open
  await page.screenshot({
    path: 'screenshots/modal_open.png'
  });

  // Click OK button on modal
  const okBtn = await page.$('#mc-modal-overlay .mc-button');
  if (okBtn) {
    await okBtn.click();
    await page.waitForTimeout(300);
  }

  // Screenshot after modal closed
  await page.screenshot({
    path: 'screenshots/modal_closed.png',
    clip: { x: box.x, y: box.y, width: box.width, height: box.height }
  });

  await browser.close();
  console.log('Test completed successfully: screenshots taken.');
})();
