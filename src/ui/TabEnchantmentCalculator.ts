import { AppAssets } from './AssetLoader';
import { ItemPicker } from './ItemPicker';
import { MaterialPicker } from './MaterialPicker';
import { MultiBtnPanel } from './MultiBtnPanel';
import { ProgressButton } from './ProgressButton';
import { attachTooltip, showTooltip } from './Tooltip';
import { translate } from '../i18n/translations';
import { VERSIONS, VersionId, isBeforeVersion } from '../enchantments/Versions';
import { getMaterialIntroducedVersion } from '../enchantments/Materials';
import * as Items from '../enchantments/Items';
import * as Enchantments from '../enchantments/Enchantments';
import { showMinecraftModal } from './Modal';
import { calculateEnchantment, applyEnchantmentDone, CalculationResult } from '../enchantments/Calculator';

export class TabEnchantmentCalculator {
  public el: HTMLElement;
  private assets: AppAssets;
  private itemPicker: ItemPicker;
  private matPicker: MaterialPicker;

  public maxShelvesInput: HTMLInputElement;
  public levelInput: HTMLInputElement;
  public versionSelect: HTMLSelectElement;

  public findButton: ProgressButton;
  public doneButton: ProgressButton;

  public outDrop: HTMLElement;
  public outSlot: HTMLElement;
  public outBook: HTMLElement;

  private scrollPane: HTMLElement;
  private enchListContainer: HTMLElement;
  private enchButtons: MultiBtnPanel[] = [];

  private curVersion: VersionId = VersionId.V1_21_11;
  private lastCalcResult: CalculationResult | null = null;
  private getPlayerSeedFn: () => string;
  private setPlayerSeedFn: (seed: string) => void;

  constructor(
    assets: AppAssets,
    getPlayerSeed: () => string,
    setPlayerSeed: (seed: string) => void
  ) {
    this.assets = assets;
    this.getPlayerSeedFn = getPlayerSeed;
    this.setPlayerSeedFn = setPlayerSeed;

    this.el = document.createElement('div');
    this.el.className = 'tab-pane';
    this.el.id = 'tab-ench-calculator';
    this.el.style.backgroundImage = `url('./data/pane2.png')`;

    // 1. Item Picker & Material Picker
    this.itemPicker = new ItemPicker(assets);
    this.matPicker = new MaterialPicker(assets);
    this.el.appendChild(this.itemPicker.canvas);
    this.el.appendChild(this.matPicker.canvas);

    this.itemPicker.onSelect((item) => {
      this.rebuildEnchantmentList(item);
    });

    this.matPicker.onCycle(() => {
      let nextMat = this.itemPicker.curMaterial;
      do {
        nextMat = (nextMat + 1) % 9;
      } while (isBeforeVersion(this.curVersion, getMaterialIntroducedVersion(nextMat)));
      this.itemPicker.setMaterial(nextMat);
      this.matPicker.setMaterial(nextMat);
    });

    // 2. Max Shelves Input
    this.maxShelvesInput = document.createElement('input');
    this.maxShelvesInput.type = 'text';
    this.maxShelvesInput.className = 'mc-input';
    this.maxShelvesInput.maxLength = 2;
    this.maxShelvesInput.value = '15';
    this.maxShelvesInput.style.left = '268px';
    this.maxShelvesInput.style.top = '12px';
    this.maxShelvesInput.style.width = '30px';
    this.maxShelvesInput.style.height = '20px';
    attachTooltip(this.maxShelvesInput, () => translate('enchCalc.maxBookshelves.tooltip'));
    this.el.appendChild(this.maxShelvesInput);

    // 3. Scroll area for Enchantments
    this.scrollPane = document.createElement('div');
    this.scrollPane.id = 'ench-scroll-pane';
    this.enchListContainer = document.createElement('div');
    this.enchListContainer.id = 'ench-list-container';
    this.scrollPane.appendChild(this.enchListContainer);
    this.el.appendChild(this.scrollPane);

    // 4. Calculate and Done Buttons
    this.findButton = new ProgressButton(
      assets,
      264,
      24,
      translate('enchCalc.calculate'),
      translate('enchCalc.calculate.tooltip')
    );
    this.findButton.setBounds(6, 190, 264, 24);
    this.el.appendChild(this.findButton.el);

    this.doneButton = new ProgressButton(
      assets,
      58,
      24,
      translate('enchCalc.done'),
      translate('enchCalc.done.tooltip')
    );
    this.doneButton.setBounds(276, 190, 58, 24);
    this.doneButton.setProgress(NaN); // initially disabled
    this.el.appendChild(this.doneButton.el);

    // 5. Output Labels
    this.outDrop = this.createOutputLabel('-', 40, 232, 120, 20, translate('enchCalc.throwCount.tooltip'));
    this.outSlot = this.createOutputLabel('-', 204, 232, 64, 20, translate('enchCalc.slot.tooltip'));
    this.outBook = this.createOutputLabel('-', 292, 232, 120, 20, translate('enchCalc.bookshelves.tooltip'));
    this.el.appendChild(this.outDrop);
    this.el.appendChild(this.outSlot);
    this.el.appendChild(this.outBook);

    // 6. Version Dropdown
    this.versionSelect = document.createElement('select');
    this.versionSelect.className = 'mc-select';
    this.versionSelect.style.left = '5px';
    this.versionSelect.style.top = '270px';
    this.versionSelect.style.width = '180px';
    for (const v of VERSIONS) {
      const opt = document.createElement('option');
      opt.value = v.id.toString();
      opt.textContent = v.name;
      if (v.id === this.curVersion) opt.selected = true;
      this.versionSelect.appendChild(opt);
    }
    this.versionSelect.addEventListener('change', () => {
      this.curVersion = parseInt(this.versionSelect.value, 10);
      while (isBeforeVersion(this.curVersion, getMaterialIntroducedVersion(this.matPicker.curMaterial))) {
        const nextMat = (this.matPicker.curMaterial + 1) % 9;
        this.matPicker.setMaterial(nextMat);
        this.itemPicker.setMaterial(nextMat);
      }
      const selItem = this.itemPicker.getSelectedItem();
      if (selItem) {
        this.rebuildEnchantmentList(selItem);
      }
    });
    this.el.appendChild(this.versionSelect);

    // 7. Player Level Input
    const lblLevel = document.createElement('div');
    lblLevel.className = 'mc-label';
    lblLevel.textContent = translate('enchCalc.level') + ' ';
    lblLevel.style.left = '205px';
    lblLevel.style.top = '270px';
    lblLevel.style.width = '62px';
    lblLevel.style.height = '20px';
    this.el.appendChild(lblLevel);

    this.levelInput = document.createElement('input');
    this.levelInput.type = 'text';
    this.levelInput.className = 'mc-input';
    this.levelInput.maxLength = 3;
    this.levelInput.value = '999';
    this.levelInput.style.left = '270px';
    this.levelInput.style.top = '270px';
    this.levelInput.style.width = '45px';
    this.levelInput.style.height = '20px';
    attachTooltip(this.levelInput, () => translate('enchCalc.level.tooltip'));
    this.el.appendChild(this.levelInput);

    this.setupActions();

    // Pre-select Netherite Sword matching default state
    this.itemPicker.setSelectedItem(Items.NETHERITE_SWORD);
    this.rebuildEnchantmentList(Items.NETHERITE_SWORD);
  }

  private createOutputLabel(
    initialText: string,
    x: number,
    y: number,
    w: number,
    h: number,
    tooltip: string
  ): HTMLElement {
    const lbl = document.createElement('div');
    lbl.className = 'mc-label';
    lbl.textContent = initialText;
    lbl.style.left = `${x}px`;
    lbl.style.top = `${y}px`;
    lbl.style.width = `${w}px`;
    lbl.style.height = `${h}px`;
    if (tooltip) {
      attachTooltip(lbl, () => tooltip);
    }
    return lbl;
  }

  private rebuildEnchantmentList(item: string): void {
    this.enchListContainer.innerHTML = '';
    this.enchButtons = [];

    let level = 30;
    const enchantability = Items.getEnchantability(item);
    level = level + 1 + Math.floor(enchantability / 4) + Math.floor(enchantability / 4);
    level += Math.round(level * 1.15);
    if (level < 1) level = 1;

    const fullList: Enchantments.EnchantmentInstance[] = [];
    while (level > 0) {
      const list = Enchantments.getHighestAllowedEnchantments(level, item, this.curVersion);
      for (const inst of list) {
        if (!fullList.some((e) => e.enchantment === inst.enchantment)) {
          fullList.push(inst);
        }
      }
      level -= 5;
    }
    fullList.sort((a, b) => a.enchantment.localeCompare(b.enchantment));

    this.enchListContainer.style.height = `${fullList.length * 26}px`;

    for (let a = 0; a < fullList.length; a++) {
      const inst = fullList[a];
      const row = document.createElement('div');
      row.className = 'ench-row';
      row.style.top = `${a * 26}px`;

      const label = document.createElement('div');
      label.className = 'ench-name';
      label.textContent = translate('ench.' + inst.enchantment);
      row.appendChild(label);

      const maxLevel = Enchantments.getMaxLevelInTable(inst.enchantment, item);
      const btn = new MultiBtnPanel(this.assets, inst.enchantment, maxLevel);
      btn.setBounds(156, 2);
      row.appendChild(btn.canvas);
      this.enchButtons.push(btn);

      this.enchListContainer.appendChild(row);
    }
  }

  private setupActions(): void {
    // Calculate button
    this.findButton.onClick(() => {
      const playerSeedHex = this.getPlayerSeedFn();
      if (!playerSeedHex) {
        showMinecraftModal(
          this.assets,
          translate('program.name'),
          translate('enchCalc.playerSeedNotFound')
        );
        return;
      }

      const item = this.itemPicker.getSelectedItem();
      if (!item) return;

      const maxShelves = parseInt(this.maxShelvesInput.value, 10);
      const playerLevel = parseInt(this.levelInput.value, 10);
      if (isNaN(maxShelves) || isNaN(playerLevel)) return;

      const wantedEnch: Enchantments.EnchantmentInstance[] = [];
      const unwantedEnch: Enchantments.EnchantmentInstance[] = [];

      for (const btn of this.enchButtons) {
        const val = btn.getSelection();
        if (val !== 0) {
          if (val === -1) {
            unwantedEnch.push({ enchantment: btn.id, level: 1 });
          } else {
            wantedEnch.push({ enchantment: btn.id, level: val });
          }
        }
      }

      const res = calculateEnchantment(
        playerSeedHex,
        item,
        maxShelves,
        playerLevel,
        wantedEnch,
        unwantedEnch,
        this.curVersion
      );

      this.lastCalcResult = res;

      if (res.timesNeeded === -2) {
        this.outDrop.textContent = translate('enchCalc.impossible');
        this.outBook.textContent = '-';
        this.outSlot.textContent = '-';
        this.doneButton.setProgress(NaN);
      } else if (res.timesNeeded === -1) {
        this.outDrop.textContent = translate('enchCalc.noDummy');
        this.outBook.textContent = String(res.bookshelvesNeeded);
        this.outSlot.textContent = String(res.slot + 1);
        this.doneButton.setProgress(-1); // enabled
      } else {
        if (res.timesNeeded > 63) {
          const stacks = Math.floor(res.timesNeeded / 64);
          const rem = res.timesNeeded % 64;
          this.outDrop.textContent = `64x${stacks} + ${rem}`;
        } else {
          this.outDrop.textContent = String(res.timesNeeded);
        }
        this.outBook.textContent = String(res.bookshelvesNeeded);
        this.outSlot.textContent = String(res.slot + 1);
        this.doneButton.setProgress(-1); // enabled
      }
    });

    // Done button
    this.doneButton.onClick(() => {
      if (!this.lastCalcResult || this.lastCalcResult.timesNeeded === -2) return;

      const curSeedHex = this.getPlayerSeedFn();
      const playerLevel = parseInt(this.levelInput.value, 10) || 0;

      const { newSeedHex, newLevel } = applyEnchantmentDone(
        curSeedHex,
        playerLevel,
        this.lastCalcResult.timesNeeded,
        this.lastCalcResult.slot
      );

      this.setPlayerSeedFn(newSeedHex);
      this.levelInput.value = String(newLevel);

      this.outDrop.textContent = '-';
      this.outSlot.textContent = '-';
      this.outBook.textContent = '-';
      this.doneButton.setProgress(NaN);
      this.lastCalcResult = null;
    });
  }
}
