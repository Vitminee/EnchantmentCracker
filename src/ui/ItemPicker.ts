import { AppAssets } from './AssetLoader';
import { ITEM_GRID } from '../enchantments/Items';
import { attachTooltip } from './Tooltip';
import { translate } from '../i18n/translations';

export class ItemPicker {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assets: AppAssets;
  public curMaterial: number = 0;
  private selectedItem: string | null = null;
  private onSelectHandler?: (item: string) => void;

  constructor(assets: AppAssets) {
    this.assets = assets;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 180;
    this.canvas.height = 72;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '42px';
    this.canvas.style.top = '6px';
    this.canvas.style.cursor = 'pointer';
    this.canvas.style.imageRendering = 'pixelated';

    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;

    attachTooltip(this.canvas, () => translate('enchCalc.item.tooltip'));

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;
      const gridX = Math.floor((clickX * 5) / 180);
      const gridY = Math.floor((clickY * 2) / 72);
      if (gridX < 0 || gridX > 4 || gridY < 0 || gridY > 1) return;

      const item = ITEM_GRID[this.curMaterial][gridY][gridX];
      if (!item) return;

      this.selectedItem = item;
      this.render();
      if (this.onSelectHandler) {
        this.onSelectHandler(item);
      }
    });

    this.render();
  }

  public getSelectedItem(): string | null {
    return this.selectedItem;
  }

  public setSelectedItem(item: string | null): void {
    this.selectedItem = item;
    this.render();
  }

  public setMaterial(matIndex: number): void {
    this.curMaterial = matIndex;
    this.render();
  }

  public onSelect(handler: (item: string) => void): void {
    this.onSelectHandler = handler;
  }

  public render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 180, 72);

    const slotW = 36;
    const slotH = 36;
    const grid = ITEM_GRID[this.curMaterial];

    // Background cells
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 2; y++) {
        const item = grid[y][x];
        const isSelected = item !== null && item === this.selectedItem;
        ctx.fillStyle = isSelected ? '#005000' : '#8b8b8b';
        ctx.fillRect(x * slotW, y * slotH, slotW, slotH);
      }
    }

    // Draw item sprites from ench_items.png
    // ench_items has 9 rows of 72px (each row is 180x72)
    const sy = this.curMaterial * 72;
    ctx.drawImage(this.assets.ench_items, 0, sy, 180, 72, 0, 0, 180, 72);
  }
}
