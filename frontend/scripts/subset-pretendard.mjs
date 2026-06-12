/**
 * Scans app source text and builds PretendardSubset.woff2 from PretendardVariable.woff2.
 * Re-run after adding large amounts of new Korean copy: npm run fonts:subset
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import subsetFont from 'subset-font';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(root, 'app');
const sourceFont = join(root, 'app/fonts/PretendardVariable.woff2');
const outputFont = join(root, 'app/fonts/PretendardSubset.woff2');

const FALLBACK_CHARS =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u00B7\u2026\u2018\u2019\u201C\u201D\u2013\u2014' +
  '\u3131\u3134\u3137\u3139\u3141\u3142\u3145\u3147\u3148\u314A\u314B\u314C\u314D\u314E\u314F\u3151\u3153\u3155\u3157\u315B\u315C\u3160\u3161\u3163';

function collectSourceFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'fonts' || entry === 'admin') continue;
      collectSourceFiles(fullPath, files);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectCharacters(files) {
  const chars = new Set(FALLBACK_CHARS.split(''));
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const char of content) {
      if (char === '\n' || char === '\r' || char === '\t') continue;
      chars.add(char);
    }
  }
  return [...chars].join('');
}

const sourceFiles = collectSourceFiles(appDir);
const text = collectCharacters(sourceFiles);
const fontBuffer = readFileSync(sourceFont);
const subsetBuffer = await subsetFont(fontBuffer, text, { targetFormat: 'woff2' });

writeFileSync(outputFont, subsetBuffer);
const sizeKb = Math.round(subsetBuffer.byteLength / 1024);
process.stdout.write(`Wrote ${outputFont} (${sizeKb} KB, ${text.length} glyphs)\n`);
