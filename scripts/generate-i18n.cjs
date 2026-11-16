const fs = require('fs');
const path = require('path');

const i18nDir = path.join('original_repo', 'resources', 'i18n');
const result = {};

for (const f of fs.readdirSync(i18nDir)) {
  if (f.endsWith('.properties')) {
    const lang = f === 'EnchantmentCracker.properties' ? 'en' : f.replace('EnchantmentCracker_', '').replace('.properties', '');
    const content = fs.readFileSync(path.join(i18nDir, f), 'utf8');
    const dict = {};
    const lines = content.split(/\r?\n/);
    let curKey = '';
    let curVal = '';

    for (let rawLine of lines) {
      if (!curKey) {
        let trimmed = rawLine.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) continue;
        const eqIdx = rawLine.indexOf('=');
        if (eqIdx !== -1) {
          const k = rawLine.substring(0, eqIdx).trim();
          let v = rawLine.substring(eqIdx + 1);
          if (v.endsWith('\\')) {
            curKey = k;
            curVal = v.slice(0, -1);
          } else {
            dict[k] = cleanValue(v);
          }
        }
      } else {
        let nextPart = rawLine.trimStart();
        if (nextPart.endsWith('\\')) {
          curVal += nextPart.slice(0, -1);
        } else {
          curVal += nextPart;
          dict[curKey] = cleanValue(curVal);
          curKey = '';
          curVal = '';
        }
      }
    }
    result[lang] = dict;
  }
}

function cleanValue(val) {
  return val
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\\\/g, '\\')
    .trim();
}

fs.mkdirSync('src/i18n', { recursive: true });
const ts = `export type TranslationKey = keyof typeof translations.en;\n\nexport const translations = ${JSON.stringify(result, null, 2)} as const;\n\nlet currentLang: keyof typeof translations = 'en';\n\nexport function setLanguage(lang: keyof typeof translations) {\n  if (translations[lang]) currentLang = lang;\n}\n\nexport function getLanguage(): string {\n  return currentLang;\n}\n\nexport function translate(key: string, ...args: (string | number)[]): string {\n  const langDict = (translations as any)[currentLang] || translations.en;\n  let text: string = langDict[key] ?? (translations.en as any)[key] ?? key;\n  if (args.length > 0) {\n    for (const arg of args) {\n      text = text.replace(/%[0-9]*\\.?[0-9]*[sfdX]/, String(arg));\n    }\n  }\n  return text;\n}\n`;

fs.writeFileSync('src/i18n/translations.ts', ts);
console.log('Regenerated src/i18n/translations.ts cleanly');
