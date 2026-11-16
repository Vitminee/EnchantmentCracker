export interface AppAssets {
  mcframe: HTMLImageElement;
  tabs: HTMLImageElement;
  pane1: HTMLImageElement;
  pane2: HTMLImageElement;
  button: HTMLImageElement;
  buttonred: HTMLImageElement;
  buttonblue: HTMLImageElement;
  glass_bottle: HTMLImageElement;
  experience_bottle: HTMLImageElement;
  book: HTMLImageElement;
  enchanted_book: HTMLImageElement;
  apple: HTMLImageElement;
  golden_apple: HTMLImageElement;
  ench_items: HTMLImageElement;
  ench_mats: HTMLImageElement;
  levelbtn: HTMLImageElement;
  levelbtnshort: HTMLImageElement;
}

const ASSET_NAMES = [
  'mcframe',
  'tabs',
  'pane1',
  'pane2',
  'button',
  'buttonred',
  'buttonblue',
  'glass_bottle',
  'experience_bottle',
  'book',
  'enchanted_book',
  'apple',
  'golden_apple',
  'ench_items',
  'ench_mats',
  'levelbtn',
  'levelbtnshort',
] as const;

export async function loadAssets(): Promise<AppAssets> {
  const assets: Partial<AppAssets> = {};
  const promises = ASSET_NAMES.map((name) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.src = `./data/${name}.png`;
      img.onload = () => {
        (assets as any)[name] = img;
        resolve();
      };
      img.onerror = (e) => {
        console.error(`Failed to load asset: ${name}`, e);
        reject(new Error(`Failed to load asset: ${name}`));
      };
    });
  });

  await Promise.all(promises);
  return assets as AppAssets;
}
