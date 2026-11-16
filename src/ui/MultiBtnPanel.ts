import { AppAssets } from './AssetLoader';

export class MultiBtnPanel {
  public id: string; // enchantment id
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private img: HTMLImageElement;
  private btnW: number;
  private numBtn: number;
  private selection: number = 1; // default '?' (value 0)
  private onChangeHandler?: (val: number) => void;

  constructor(assets: AppAssets, id: string, maxV: number) {
    this.id = id;
    this.img = maxV === 1 ? assets.levelbtnshort : assets.levelbtn;
    const c = maxV === 1 ? 3 : 7;
    this.btnW = Math.floor(this.img.width / c); // 22
    this.numBtn = maxV + 2;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.btnW * this.numBtn;
    this.canvas.height = 22;
    this.canvas.style.position = 'absolute';
    this.canvas.style.cursor = 'pointer';
    this.canvas.style.imageRendering = 'pixelated';

    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const x = (e.clientX - rect.left) * scaleX;
      const clicked = Math.floor(x / this.btnW);
      if (clicked >= 0 && clicked < this.numBtn) {
        this.selection = clicked;
        this.render();
        if (this.onChangeHandler) {
          this.onChangeHandler(this.getSelection());
        }
      }
    });

    this.render();
  }

  public setBounds(x: number, y: number): void {
    this.canvas.style.left = `${x}px`;
    this.canvas.style.top = `${y}px`;
  }

  public getSelection(): number {
    return this.selection - 1; // -1 for '-', 0 for '?', 1..max for levels
  }

  public setSelection(val: number): void {
    this.selection = val + 1;
    this.render();
  }

  public onChange(handler: (val: number) => void): void {
    this.onChangeHandler = handler;
  }

  public render(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);

    // Draw unselected background row
    // Top 22px of this.img
    ctx.drawImage(this.img, 0, 0, w, 22, 0, 0, w, h);

    // Draw active button from bottom 22px
    if (this.selection >= 0 && this.selection < this.numBtn) {
      const sx = this.selection * this.btnW;
      const sy = 22;
      ctx.drawImage(this.img, sx, sy, this.btnW, 22, sx, 0, this.btnW, h);
    }
  }
}
