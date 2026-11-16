import { AppAssets } from './AssetLoader';
import { attachTooltip } from './Tooltip';

export class ProgressButton {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: AppAssets;
  private text: string;
  private progress: number = -1; // -1: normal enabled, 0..1: in-progress, Infinity: success, NaN: fail
  private enabled: boolean = true;
  private isPressed: boolean = false;
  private onClickHandler?: () => void;
  private tooltipText: string = '';

  constructor(
    assets: AppAssets,
    width: number,
    height: number,
    initialText: string,
    tooltip: string = ''
  ) {
    this.assets = assets;
    this.text = initialText;
    this.tooltipText = tooltip;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.position = 'absolute';
    this.canvas.style.cursor = 'pointer';
    this.canvas.style.imageRendering = 'pixelated';

    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.setupEvents();
    this.render();

    if (tooltip) {
      attachTooltip(this.canvas, () => this.tooltipText);
    }
  }

  private setupEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0 || !this.enabled || (this.progress >= 0 && this.progress <= 1)) return;
      this.isPressed = true;
      this.render();
    });

    window.addEventListener('mouseup', () => {
      if (this.isPressed) {
        this.isPressed = false;
        this.render();
      }
    });

    this.canvas.addEventListener('click', () => {
      if (!this.enabled || (this.progress >= 0 && this.progress <= 1)) return;
      if (this.onClickHandler) this.onClickHandler();
    });
  }

  public setBounds(x: number, y: number, w: number, h: number): void {
    this.canvas.style.left = `${x}px`;
    this.canvas.style.top = `${y}px`;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.ctx.imageSmoothingEnabled = false;
      this.render();
    }
  }

  public onClick(handler: () => void): void {
    this.onClickHandler = handler;
  }

  public setText(text: string): void {
    this.text = text;
    this.render();
  }

  public getText(): string {
    return this.text;
  }

  public setToolTipText(tooltip: string): void {
    this.tooltipText = tooltip;
  }

  public setProgress(progress: number): void {
    this.progress = progress;
    this.enabled = progress === -1;
    this.render();
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.render();
  }

  public render(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    const btnImg = this.assets.button;
    // 3 states: 0: normal, 1: pressed, 2: disabled
    let stateIdx = 0;
    if (!this.enabled && this.progress === -1) {
      stateIdx = 2;
    } else if (this.isPressed) {
      stateIdx = 1;
    } else if (this.progress >= 0 && this.progress <= 1) {
      stateIdx = 2;
    }

    const sy = stateIdx * 22;

    // Draw 9-slice / 3-slice button
    // Left edge (2px wide)
    ctx.drawImage(btnImg, 0, sy, 2, 22, 0, 0, 2, h);
    // Center stretch (1px wide)
    ctx.drawImage(btnImg, 2, sy, 1, 22, 2, 0, w - 4, h);
    // Right edge (2px wide)
    ctx.drawImage(btnImg, 3, sy, 2, 22, w - 2, 0, 2, h);

    // Green progress bar fill
    if (this.progress === Infinity) {
      ctx.fillStyle = '#005000';
      ctx.fillRect(2, 2, w - 4, h - 4);
    } else if (this.progress >= 0 && this.progress <= 1) {
      ctx.fillStyle = '#005000';
      const fillW = Math.min(w - 4, Math.floor((w - 4) * this.progress));
      ctx.fillRect(2, 2, fillW, h - 4);
    }

    // Text
    ctx.font = '11px "Minecraftia", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    let displayStr = this.text;
    let textColor = '#000000';

    if (this.progress === Infinity) {
      textColor = '#ffffff';
    } else if (this.progress >= 0 && this.progress <= 1) {
      textColor = '#ffffff';
      displayStr = `Progress: ${(this.progress * 100).toFixed(0)}%`;
    } else if (Number.isNaN(this.progress)) {
      textColor = '#000000';
    } else if (!this.enabled) {
      textColor = '#7f7f7f';
    }

    ctx.fillStyle = textColor;
    ctx.fillText(displayStr, Math.floor(w / 2), Math.floor(h / 2) + 1);
  }
}
