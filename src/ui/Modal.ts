import { AppAssets } from './AssetLoader';
import { ProgressButton } from './ProgressButton';

let activeModalOverlay: HTMLElement | null = null;

export function showMinecraftModal(
  assets: AppAssets,
  title: string,
  message: string,
  onClose?: () => void
): void {
  if (activeModalOverlay) {
    activeModalOverlay.remove();
    activeModalOverlay = null;
  }

  const overlay = document.createElement('div');
  overlay.id = 'mc-modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '99999';

  const modalBox = document.createElement('div');
  modalBox.style.position = 'relative';
  modalBox.style.width = '300px';
  modalBox.style.height = '160px';
  modalBox.style.filter = 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.8))';

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 160;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.imageRendering = 'pixelated';

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const w = 300;
  const h = 160;
  const edgeW = 8;
  const edgeH = 8;

  // Draw 9-slice mcframe
  ctx.drawImage(assets.mcframe, 0, 0, edgeW, edgeH, 0, 0, edgeW, edgeH);
  ctx.drawImage(assets.mcframe, 9, 0, edgeW, edgeH, w - edgeW, 0, edgeW, edgeH);
  ctx.drawImage(assets.mcframe, 0, 9, edgeW, edgeH, 0, h - edgeH, edgeW, edgeH);
  ctx.drawImage(assets.mcframe, 9, 9, edgeW, edgeH, w - edgeW, h - edgeH, edgeW, edgeH);

  ctx.drawImage(assets.mcframe, 8, 0, 1, edgeH, edgeW, 0, w - 16, edgeH);
  ctx.drawImage(assets.mcframe, 8, 9, 1, edgeH, edgeW, h - edgeH, w - 16, edgeH);
  ctx.drawImage(assets.mcframe, 0, 8, edgeW, 1, 0, edgeH, edgeW, h - 16);
  ctx.drawImage(assets.mcframe, 9, 8, edgeW, 1, w - edgeW, edgeH, edgeW, h - 16);

  ctx.drawImage(assets.mcframe, 8, 8, 1, 1, edgeW, edgeH, w - 16, h - 16);

  // Title
  ctx.font = '11px "Minecraftia", sans-serif';
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';
  ctx.fillText(title, 12, 10);

  modalBox.appendChild(canvas);

  // Message content
  const msgEl = document.createElement('div');
  msgEl.style.position = 'absolute';
  msgEl.style.top = '36px';
  msgEl.style.left = '16px';
  msgEl.style.width = '268px';
  msgEl.style.color = '#000000';
  msgEl.style.fontFamily = '"Minecraftia", sans-serif';
  msgEl.style.fontSize = '10px';
  msgEl.style.lineHeight = '16px';
  msgEl.textContent = message;
  modalBox.appendChild(msgEl);

  // OK Button
  const okBtn = new ProgressButton(assets, 70, 22, 'OK');
  okBtn.setBounds(115, 122, 70, 22);
  okBtn.onClick(() => {
    overlay.remove();
    activeModalOverlay = null;
    if (onClose) onClose();
  });
  modalBox.appendChild(okBtn.canvas);

  overlay.appendChild(modalBox);
  document.body.appendChild(overlay);
  activeModalOverlay = overlay;
}
