import { AppAssets } from './AssetLoader';
import { translate } from '../i18n/translations';
import { showTooltip, hideTooltip } from './Tooltip';

export class MinecraftFrame {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: AppAssets;
  public curTab: number = 0; // 0: Cracker, 1: Calculator, 2: About
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private windowEl: HTMLElement;
  private titleEl: HTMLElement;
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

    // DOM title for razor-sharp vector text rendering
    let existingTitle = document.getElementById('window-title');
    if (!existingTitle) {
      this.titleEl = document.createElement('div');
      this.titleEl.id = 'window-title';
      this.windowEl.appendChild(this.titleEl);
    } else {
      this.titleEl = existingTitle;
    }
    this.titleEl.textContent = this.tabTitles[0];

    this.setupEvents();
    this.render();
  }

  public onTabChange(handler: (tab: number) => void): void {
    this.onTabChangeHandler = handler;
  }

  public setTab(tab: number): void {
    if (tab >= 0 && tab <= 2) {
      this.curTab = tab;
      this.titleEl.textContent = this.tabTitles[tab];
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
      hideTooltip();
    });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Tab click
      if (y < 52) {
        const tabIdx = Math.floor(x / 54);
        if (tabIdx >= 0 && tabIdx < 3) {
          this.setTab(tabIdx);
          return;
        }
      }

      // Drag from title bar / top header
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
    // Corners:
    ctx.drawImage(this.assets.mcframe, 9, 0, edgeW, edgeH, w - edgeW, tabH, edgeW, edgeH);
    ctx.drawImage(this.assets.mcframe, 0, 9, edgeW, edgeH, 0, h - edgeH, edgeW, edgeH);
    ctx.drawImage(this.assets.mcframe, 9, 9, edgeW, edgeH, w - edgeW, h - edgeH, edgeW, edgeH);

    // Edges:
    ctx.drawImage(this.assets.mcframe, 8, 0, 1, edgeH, edgeW, tabH, w - 16, edgeH);
    ctx.drawImage(this.assets.mcframe, 8, 9, 1, edgeH, edgeW, h - edgeH, w - 16, edgeH);
    ctx.drawImage(this.assets.mcframe, 0, 8, edgeW, 1, 0, tabH + edgeH, edgeW, h - tabH - 16);
    ctx.drawImage(this.assets.mcframe, 9, 8, edgeW, 1, w - edgeW, tabH + edgeH, edgeW, h - tabH - 16);

    // Center fill
    ctx.drawImage(this.assets.mcframe, 8, 8, 1, 1, edgeW, tabH + edgeH, w - 16, h - tabH - 16);

    // 2. Draw tabs header from tabs.png (164 x 186)
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
  }
}
