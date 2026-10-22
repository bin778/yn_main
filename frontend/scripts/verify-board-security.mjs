import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const loadModule = createRequire(import.meta.url);

for (const extension of ['.ts', '.tsx']) {
  loadModule.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
      fileName: filename,
    });
    module._compile(outputText, filename);
  };
}

const BoardContentBody = loadModule('../app/components/BoardContentBody.tsx').default;
const { sanitizeLegacyBoardHtml } = loadModule('../app/admin/lib/sanitizeLegacyBoardHtml.ts');
const payloads = [
  '<img src="/fixture.png" onerror="window.__fixture=1">',
  '<svg onload="window.__fixture=1"></svg>',
  '<a href="javascript:window.__fixture=1">link</a>',
  '<a href="java&#x09;script:window.__fixture=1">link</a>',
  '<script>window.__fixture=1</script><p>safe</p>',
  '<iframe srcdoc="<script>window.__fixture=1</script>"></iframe>',
  '<div style="background-image:url(https://example.invalid/pixel);position:fixed;inset:0">body</div>',
];
for (const payload of payloads) {
  const rendered = renderToStaticMarkup(React.createElement(BoardContentBody, { html: payload }));
  assert.doesNotMatch(rendered, /onerror|onload|javascript:|<script|<iframe|background-image|position:\s*fixed/i);
}
const legacy = '<table width="100%" bgcolor="#fafafa"><tr><td style="width:130px;vertical-align:top">'
  + '<a href="tel:02-318-2981" style="line-height:54px;border-radius:50px">서울</a></td></tr></table>';
const clean = sanitizeLegacyBoardHtml(legacy);
assert.match(clean, /<table/);
assert.match(clean, /width="100%"/);
assert.match(clean, /tel:02-318-2981/);
assert.match(clean, /border-radius:\s*50px/);
assert.match(clean, /vertical-align:\s*top/);
assert.equal(sanitizeLegacyBoardHtml(clean), clean, 'sanitization must be idempotent');

loadModule('./verify-legacy-sanitize.ts');
process.stdout.write('Passed public board rendering security checks and legacy formatting checks.\n');
