import { translate } from '../i18n/translations';

export class TabAbout {
  public el: HTMLElement;

  constructor(version: string = 'V1.9') {
    this.el = document.createElement('div');
    this.el.className = 'tab-pane';
    this.el.id = 'tab-about';

    const content = document.createElement('div');
    content.id = 'about-content';

    const rawAbout = translate('program.about', version);
    const lines = rawAbout.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        const br = document.createElement('div');
        br.style.height = '10px';
        content.appendChild(br);
        continue;
      }

      if (line.startsWith('LINK')) {
        const parts = line.split(' ');
        const url = parts[1];
        const text = parts.slice(2).join(' ');
        const p = document.createElement('div');
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = text;
        p.appendChild(a);
        content.appendChild(p);
        continue;
      }

      const p = document.createElement('div');
      p.textContent = line;
      content.appendChild(p);
    }

    this.el.appendChild(content);
  }
}
