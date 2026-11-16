import { AppAssets } from './AssetLoader';
import { translate } from '../i18n/translations';
import { showTooltip, hideTooltip } from './Tooltip';

export class MinecraftFrame {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: AppAssets;
  public curTab: number = 0; // 0: Cracker, 1: Calculator, 2: About
  private isClosePressed: boolean = false;
  private isCloseHovered: boolean = false;
  private isPinned: boolean = false;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private windowEl: HTMLElement;
  private onTabChangeHandler?: (tab: number) => void;

  private tabTitles: string[] = [];

  constructor(assets: AppAssets, windowEl: HTMLElement) {
    this.assets = assets;
    this.windowEl = windowEl;
    this.canvas = document.getElementById('window-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.tabTitles = [
      translate('tab.enchantmentCracker'),
      translate('tab.enchantmentCalculator'),
      translate('tab.about'),
    ];

    this.setupEvents();
    this.render();
  }

  public onTabChange(handler: (tab: number) => void): void {
    this.onTabChangeHandler = handler;
  }

  public setTab(tab: number): void {
    if (tab >= 0 && tab <= 2) {
      this.curTab = tab;
      this.render();
      if (this.onTabChangeHandler) {
        this.onTabChangeHandler(tab);
      }
    }
  }

  private setupEvents(): void {
    const canvas = this.canvas;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Close button check
      const wasHovered = this.isCloseHovered;
      this.isCloseHovered = x >= 328 && x < 346 && y >= 60 && y < 78;
      if (wasHovered !== this.isCloseHovered) {
        this.render();
      }

      // Tab hover tooltip
      if (y < 52) {
        const tabIdx = Math.floor(x / 54);
        if (tabIdx >= 0 && tabIdx < 3) {
          showTooltip(this.tabTitles[tabIdx], e.clientX, e.clientY);
          return;
        }
      }
      hideTooltip();
    });

    canvas.addEventListener('mouseleave', () => {
      if (this.isCloseHovered) {
        this.isCloseHovered = false;
        this.render();
      }
      hideTooltip();
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Close button
      if (x >= 328 && x < 346 && y >= 60 && y < 78) {
        this.isClosePressed = true;
        this.render();
        return;
      }

      // Pin button
      if (x >= 306 && x < 324 && y >= 60 && y < 78) {
        this.isPinned = !this.isPinned;
        this.render();
        return;
      }

      // Tab click
      if (y < 52) {
        const tabIdx = Math.floor(x / 54);
        if (tabIdx >= 0 && tabIdx < 3) {
          this.setTab(tabIdx);
          return;
        }
      }

      // Start drag from title bar or borders
      if (y < 78) {
        this.isDragging = true;
        this.dragStartX = e.clientX - this.windowEl.offsetLeft;
        this.dragStartY = e.clientY - this.windowEl.offsetTop;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        let newX = e.clientX - this.dragStartX;
        let newY = e.clientY - this.dragStartY;
        // Keep slightly bounded
        newX = Math.max(-150, Math.min(window.innerWidth - 150, newX));
        newY = Math.max(0, Math.min(window.innerHeight - 100, newY));
        this.windowEl.style.left = `${newX}px`;
        this.windowEl.style.top = `${newY}px`;
        this.windowEl.style.position = 'fixed';
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
      }
      if (this.isClosePressed) {
        if (this.isCloseHovered) {
          // Reset window position or reset state
          this.windowEl.style.left = '50%';
          this.windowEl.style.top = '50%';
          this.windowEl.style.transform = 'translate(-50%, -50%)';
          this.windowEl.style.position = 'absolute';
        }
        this.isClosePressed = false;
        this.render();
      }
    });
  }

  public render(): void {
    const ctx = this.ctx;
    const w = 354;
    const h = 390;
    ctx.clearRect(0, 0, w, h);

    const tabH = 52;
    const edgeW = 8;
    const edgeH = 8;

    // 1. Draw outer frame 9-slice from mcframe.png (17x17)
    // Corners: (top-left is covered by tabs, matching Java StyledBorder)
    // Top-Right (9, 0, 8, 8) -> (w - 8, tabH, 8, 8)
    ctx.drawImage(this.assets.mcframe, 9, 0, edgeW, edgeH, w - edgeW, tabH, edgeW, edgeH);
    // Bottom-Left (0, 9, 8, 8) -> (0, h - 8, 8, 8)
    ctx.drawImage(this.assets.mcframe, 0, 9, edgeW, edgeH, 0, h - edgeH, edgeW, edgeH);
    // Bottom-Right (9, 9, 8, 8) -> (w - 8, h - 8, 8, 8)
    ctx.drawImage(this.assets.mcframe, 9, 9, edgeW, edgeH, w - edgeW, h - edgeH, edgeW, edgeH);

    // Edges:
    // Top (8, 0, 1, 8) -> (edgeW, tabH, w - 16, 8)
    ctx.drawImage(this.assets.mcframe, 8, 0, 1, edgeH, edgeW, tabH, w - 16, edgeH);
    // Bottom (8, 9, 1, 8) -> (edgeW, h - 8, w - 16, 8)
    ctx.drawImage(this.assets.mcframe, 8, 9, 1, edgeH, edgeW, h - edgeH, w - 16, edgeH);
    // Left (0, 8, 8, 1) -> (0, tabH + 8, 8, h - tabH - 16)
    ctx.drawImage(this.assets.mcframe, 0, 8, edgeW, 1, 0, tabH + edgeH, edgeW, h - tabH - 16);
    // Right (9, 8, 8, 1) -> (w - 8, tabH + 8, 8, h - tabH - 16)
    ctx.drawImage(this.assets.mcframe, 9, 8, edgeW, 1, w - edgeW, tabH + edgeH, edgeW, h - tabH - 16);

    // Center fill (8, 8, 1, 1)
    ctx.drawImage(this.assets.mcframe, 8, 8, 1, 1, edgeW, tabH + edgeH, w - 16, h - tabH - 16);

    // 2. Draw tabs header from tabs.png (164 x 186)
    // tabs.png has 3 states of height 62 each
    const tabSy = this.curTab * 62;
    ctx.drawImage(this.assets.tabs, 0, tabSy, 164, 62, 0, 0, 164, 62);

    // Draw Tab Icons (16x16 scaled 2x to 32x32 at x = a * 54 + 12, y = 12)
    const iconUnselected = [
      this.assets.glass_bottle,
      this.assets.book,
      this.assets.apple,
    ];
    const iconSelected = [
      this.assets.experience_bottle,
      this.assets.enchanted_book,
      this.assets.golden_apple,
    ];

    for (let a = 0; a < 3; a++) {
      const icon = a === this.curTab ? iconSelected[a] : iconUnselected[a];
      ctx.drawImage(icon, 0, 0, 16, 16, a * 54 + 12, 12, 32, 32);
    }

    // 3. Draw Title text at (10, 65) matching Java 5 + ascent + tabH (5 + 8 + 52)
    ctx.font = '8px "Minecraftia", sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillText(this.tabTitles[this.curTab], 10, 65);

    // 4. Draw Window control buttons
    // Pin Button (306, 60, 18, 18) - buttonblue.png (36x18)
    const pinSx = this.isPinned ? 18 : 0;
    ctx.drawImage(this.assets.buttonblue, pinSx, 0, 18, 18, 306, 60, 18, 18);

    // Close Button (328, 60, 18, 18) - buttonred.png (36x18)
    const closeSx = this.isClosePressed && this.isCloseHovered ? 18 : 0;
    ctx.drawImage(this.assets.buttonred, closeSx, 0, 18, 18, 328, 60, 18, 18);
  }
}
