import { AppAssets } from './AssetLoader';
import { attachTooltip } from './Tooltip';
import { translate } from '../i18n/translations';

export class MaterialPicker {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: AppAssets;
  public curMaterial: number = 0;
  private onCycleHandler?: () => void;

  constructor(assets: AppAssets) {
    this.assets = assets;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 36;
    this.canvas.height = 36;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '298px';
    this.canvas.style.top = '42px';
    this.canvas.style.cursor = 'pointer';
    this.canvas.style.imageRendering = 'pixelated';

    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    attachTooltip(this.canvas, () => translate('enchCalc.material.tooltip'));

    this.canvas.addEventListener('click', () => {
      if (this.onCycleHandler) {
        this.onCycleHandler();
      }
    });

    this.render();
  }

  public setMaterial(matIndex: number): void {
    this.curMaterial = matIndex;
    this.render();
  }

  public onCycle(handler: () => void): void {
    this.onCycleHandler = handler;
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 36, 36);

    // Frame sy is curMaterial * 36
    const sy = this.curMaterial * 36;
    ctx.drawImage(this.assets.ench_mats, 0, sy, 36, 36, 0, 0, 36, 36);
  }
}
