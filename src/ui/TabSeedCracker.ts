import { AppAssets } from './AssetLoader';
import { SeedCracker } from '../cracker/SeedCracker';
import { calculatePlayerSeed } from '../cracker/PlayerSeed';
import { ProgressButton } from './ProgressButton';
import { translate } from '../i18n/translations';
import { attachTooltip } from './Tooltip';

export class TabSeedCracker {
  public el: HTMLElement;
  private assets: AppAssets;
  private cracker: SeedCracker;

  public bookshelvesInput: HTMLInputElement;
  public slot1Input: HTMLInputElement;
  public slot2Input: HTMLInputElement;
  public slot3Input: HTMLInputElement;

  public xpSeed1Input: HTMLInputElement;
  public xpSeed2Input: HTMLInputElement;
  public playerSeedInput: HTMLInputElement;

  public progressBar: ProgressButton;
  public btnReset: ProgressButton;
  public btnCalculate: ProgressButton;

  constructor(assets: AppAssets, cracker: SeedCracker) {
    this.assets = assets;
    this.cracker = cracker;

    this.el = document.createElement('div');
    this.el.className = 'tab-pane';
    this.el.id = 'tab-seed-cracker';
    this.el.style.backgroundImage = `url('./data/pane1.png')`;

    // 1. Labels
    const lblXp1 = this.createLabel(translate('enchCrack.xpSeed1'), 0, 0, 140, 20);
    const lblXp2 = this.createLabel(translate('enchCrack.xpSeed2'), 0, 40, 140, 20);
    this.el.appendChild(lblXp1);
    this.el.appendChild(lblXp2);

    // 2. XP Seed Inputs
    this.xpSeed1Input = this.createHexInput(0, 20, 102, 20, 8, translate('enchCrack.xpSeed1.tooltip'));
    this.xpSeed2Input = this.createHexInput(0, 60, 102, 20, 8, translate('enchCrack.xpSeed2.tooltip'));
    this.playerSeedInput = this.createHexInput(0, 110, 152, 22, 12, '');
    this.el.appendChild(this.xpSeed1Input);
    this.el.appendChild(this.xpSeed2Input);
    this.el.appendChild(this.playerSeedInput);

    // 3. Bookshelf & Slot Inputs
    this.bookshelvesInput = this.createNumberInput(225, 46, 30, 20, 2, translate('enchCrack.bookshelves.tooltip'));
    this.slot1Input = this.createNumberInput(290, 154, 30, 20, 2, translate('enchCrack.xpCost1.tooltip'));
    this.slot2Input = this.createNumberInput(290, 192, 30, 20, 2, translate('enchCrack.xpCost2.tooltip'));
    this.slot3Input = this.createNumberInput(290, 230, 30, 20, 2, translate('enchCrack.xpCost3.tooltip'));
    this.el.appendChild(this.bookshelvesInput);
    this.el.appendChild(this.slot1Input);
    this.el.appendChild(this.slot2Input);
    this.el.appendChild(this.slot3Input);

    // 4. Calculate Player Seed Button
    this.btnCalculate = new ProgressButton(
      this.assets,
      152,
      22,
      translate('enchCrack.calculate')
    );
    this.btnCalculate.setBounds(0, 84, 152, 22);
    this.el.appendChild(this.btnCalculate.el);

    // 5. Check Progress Button
    this.progressBar = new ProgressButton(
      this.assets,
      252,
      22,
      translate('enchCrack.check'),
      translate('enchCrack.check.tooltip')
    );
    this.progressBar.setBounds(0, 282, 252, 22);
    this.el.appendChild(this.progressBar.el);

    // 6. Reset Button
    this.btnReset = new ProgressButton(
      this.assets,
      80,
      22,
      translate('enchCrack.reset'),
      translate('enchCrack.reset.tooltip')
    );
    this.btnReset.setBounds(258, 282, 80, 22);
    this.el.appendChild(this.btnReset.el);

    this.setupActions();
  }

  private createLabel(text: string, x: number, y: number, w: number, h: number): HTMLElement {
    const lbl = document.createElement('div');
    lbl.className = 'mc-label';
    lbl.textContent = text;
    lbl.style.left = `${x}px`;
    lbl.style.top = `${y}px`;
    lbl.style.width = `${w}px`;
    lbl.style.height = `${h}px`;
    return lbl;
  }

  private createHexInput(x: number, y: number, w: number, h: number, maxLen: number, tooltip: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mc-input';
    input.maxLength = maxLen;
    input.style.left = `${x}px`;
    input.style.top = `${y}px`;
    input.style.width = `${w}px`;
    input.style.height = `${h}px`;

    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
    });

    if (tooltip) {
      attachTooltip(input, () => tooltip);
    }
    return input;
  }

  private createNumberInput(x: number, y: number, w: number, h: number, maxLen: number, tooltip: string): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'mc-input';
    input.maxLength = maxLen;
    input.style.left = `${x}px`;
    input.style.top = `${y}px`;
    input.style.width = `${w}px`;
    input.style.height = `${h}px`;

    input.addEventListener('input', () => {
      input.classList.remove('invalid');
      input.value = input.value.replace(/[^0-9]/g, '');
    });

    if (tooltip) {
      attachTooltip(input, () => tooltip);
    }
    return input;
  }

  private setupActions(): void {
    // Check Button
    this.progressBar.onClick(async () => {
      this.bookshelvesInput.classList.remove('invalid');
      this.slot1Input.classList.remove('invalid');
      this.slot2Input.classList.remove('invalid');
      this.slot3Input.classList.remove('invalid');

      const b = parseInt(this.bookshelvesInput.value, 10);
      const s1 = parseInt(this.slot1Input.value, 10);
      const s2 = parseInt(this.slot2Input.value, 10);
      const s3 = parseInt(this.slot3Input.value, 10);

      let hasError = false;
      if (isNaN(b) || b < 0 || b > 15) {
        this.bookshelvesInput.classList.add('invalid');
        hasError = true;
      }
      if (isNaN(s1) || s1 < 0 || s1 > 30) {
        this.slot1Input.classList.add('invalid');
        hasError = true;
      }
      if (isNaN(s2) || s2 < 0 || s2 > 30) {
        this.slot2Input.classList.add('invalid');
        hasError = true;
      }
      if (isNaN(s3) || s3 < 0 || s3 > 30) {
        this.slot3Input.classList.add('invalid');
        hasError = true;
      }
      if (hasError) return;

      this.progressBar.setProgress(0);

      const result = await this.cracker.crack(b, s1, s2, s3, (prog) => {
        this.progressBar.setProgress(prog);
      });

      this.bookshelvesInput.value = '';
      this.slot1Input.value = '';
      this.slot2Input.value = '';
      this.slot3Input.value = '';

      if (result.possibleCount === 0) {
        this.progressBar.setText(translate('enchCrack.impossible'));
        this.progressBar.setProgress(NaN);
      } else if (result.possibleCount === 1 && result.seed !== null) {
        const hex = (result.seed >>> 0).toString(16).toUpperCase().padStart(8, '0');
        this.progressBar.setText(`XP seed: ${hex}`);
        this.progressBar.setProgress(0);

        if (!this.xpSeed1Input.value) {
          this.xpSeed1Input.value = hex;
        } else if (!this.xpSeed2Input.value) {
          this.xpSeed2Input.value = hex;
        }
      } else {
        this.progressBar.setText(this.cracker.getRemainingSeedsText(result.possibleCount));
        this.progressBar.setProgress(-1);
      }
    });

    // Reset Button
    this.btnReset.onClick(() => {
      this.cracker.reset();
      this.bookshelvesInput.value = '';
      this.slot1Input.value = '';
      this.slot2Input.value = '';
      this.slot3Input.value = '';
      this.progressBar.setText(translate('enchCrack.check'));
      this.progressBar.setProgress(-1);
      this.btnCalculate.setText(translate('enchCrack.calculate'));
      this.btnCalculate.setProgress(-1);
    });

    // Calculate Seed Button
    this.btnCalculate.onClick(() => {
      const s1 = this.xpSeed1Input.value.trim();
      const s2 = this.xpSeed2Input.value.trim();
      if (!s1 || !s2) return;

      const playerSeed = calculatePlayerSeed(s1, s2);
      if (playerSeed) {
        this.playerSeedInput.value = playerSeed;
        this.btnCalculate.setText('Success!');
        this.btnCalculate.setProgress(Infinity);
      } else {
        this.btnCalculate.setText('Fail!');
        this.btnCalculate.setProgress(NaN);
      }
    });
  }
}
