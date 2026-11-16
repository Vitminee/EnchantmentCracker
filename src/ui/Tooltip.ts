let tooltipEl: HTMLElement | null = null;

export function initTooltip(): void {
  tooltipEl = document.getElementById('mc-tooltip');
}

export function showTooltip(text: string, x: number, y: number): void {
  if (!tooltipEl || !text) return;
  const clean = text.replace(/<[^>]*>/g, '').trim();
  tooltipEl.textContent = clean;
  tooltipEl.style.display = 'block';

  // Offset slightly from cursor
  let posX = x + 12;
  let posY = y - 12;

  // Keep within window
  const rect = tooltipEl.getBoundingClientRect();
  if (posX + rect.width > window.innerWidth) {
    posX = x - rect.width - 6;
  }
  if (posY + rect.height > window.innerHeight) {
    posY = window.innerHeight - rect.height - 6;
  }
  if (posY < 4) posY = 4;

  tooltipEl.style.left = `${posX}px`;
  tooltipEl.style.top = `${posY}px`;
}

export function hideTooltip(): void {
  if (tooltipEl) {
    tooltipEl.style.display = 'none';
  }
}

export function attachTooltip(el: HTMLElement, getTooltipText: () => string): void {
  el.addEventListener('mouseenter', (e) => {
    const text = getTooltipText();
    if (text) showTooltip(text, e.clientX, e.clientY);
  });
  el.addEventListener('mousemove', (e) => {
    const text = getTooltipText();
    if (text) showTooltip(text, e.clientX, e.clientY);
  });
  el.addEventListener('mouseleave', () => {
    hideTooltip();
  });
}
