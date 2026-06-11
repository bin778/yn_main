import { cpSync, existsSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules/tinymce');
const destination = join(root, 'public/tinymce');

if (!existsSync(source)) {
  process.exit(0);
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });
