import './style.css';
import { loadAssets } from './ui/AssetLoader';
import { initTooltip } from './ui/Tooltip';
import { MinecraftFrame } from './ui/Frame';
import { SeedCracker } from './cracker/SeedCracker';
import { TabSeedCracker } from './ui/TabSeedCracker';
import { TabEnchantmentCalculator } from './ui/TabEnchantmentCalculator';
import { TabAbout } from './ui/TabAbout';

async function bootstrap() {
  initTooltip();

  const assets = await loadAssets();
  const cracker = new SeedCracker();

  const windowEl = document.getElementById('minecraft-window')!;
  const contentEl = document.getElementById('window-content')!;

  const frame = new MinecraftFrame(assets, windowEl);

  const tab0 = new TabSeedCracker(assets, cracker);
  const tab1 = new TabEnchantmentCalculator(
    assets,
    () => tab0.playerSeedInput.value.trim(),
    (newSeed) => {
      tab0.playerSeedInput.value = newSeed;
    }
  );
  const tab2 = new TabAbout('V1.9');

  contentEl.appendChild(tab0.el);
  contentEl.appendChild(tab1.el);
  contentEl.appendChild(tab2.el);

  const tabPanes = [tab0.el, tab1.el, tab2.el];

  function showTab(index: number) {
    tabPanes.forEach((p, idx) => {
      if (idx === index) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  frame.onTabChange((tab) => {
    showTab(tab);
  });

  // Default to Tab 0
  showTab(0);
}

bootstrap().catch((err) => {
  (window as any).__ERROR__ = err?.stack || err?.message || String(err);
  console.error('Failed to initialize Enchantment Cracker:', err);
});
