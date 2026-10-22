import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const frontendRoot = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const runtimeOptions = config.env?.NODE_OPTIONS ?? '';
assert.match(
  runtimeOptions,
  /(?:^|\s)--experimental-require-module(?:\s|$)/,
  'Vercel must enable require(ESM) for the server-side DOMPurify dependency chain',
);

// Vercel disables require(ESM) by default. Apply our deployment override after that baseline.
const result = spawnSync(process.execPath, ['scripts/verify-board-security.mjs'], {
  cwd: frontendRoot,
  env: {
    ...process.env,
    NODE_OPTIONS: `--no-experimental-require-module ${runtimeOptions}`,
  },
  stdio: 'inherit',
});
if (result.error) throw result.error;
assert.equal(result.status, 0, 'Board rendering must work with the Vercel runtime configuration');
process.stdout.write('Passed Vercel runtime module-loading regression check.\n');
