import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules/tinymce');
const destination = join(root, 'public/tinymce');
const langSource = join(root, 'scripts/tinymce-langs/ko_KR.js');
const langDestination = join(destination, 'langs/ko_KR.js');

if (!existsSync(source)) {
  process.exit(0);
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });

if (existsSync(langSource)) {
  mkdirSync(join(destination, 'langs'), { recursive: true });
  cpSync(langSource, langDestination);
}
